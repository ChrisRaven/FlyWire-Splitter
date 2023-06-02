document.addEventListener('dock-ready', () => {
  addHtml()
  addNextButton()
  main()
})


if (!document.getElementById('dock-script')) {
  let script = document.createElement('script')
  script.id = 'dock-script'
  script.src = typeof DEV !== 'undefined' ? 'http://127.0.0.1:5501/FlyWire-Dock/Dock.js' : 'https://chrisraven.github.io/FlyWire-Dock/Dock.js'
  document.head.appendChild(script)
}

function addHtml() {
  const html = /*html*/`
    <div class="kk-filtering-header">BATCHES</div>
    <div class="kk-filtering-button-group">
      <button id="kk-filtering-add-to-storage">add</button>
      <button id="kk-filtering-save-left">save left</button>
    </div>
  `

  document.body.insertAdjacentHTML('beforeend', html)
}


function addNextButton() {
  const batchSize = 20
  const nextButton = document.createElement('button')
  nextButton.id = 'kk-filtering-next-batch'
  nextButton.innerHTML = 'Next (<span class="next-batch-batch-number">0</span>)<br /><span class="next-batch-total-counter">[?]</span>'
  document.body.appendChild(nextButton)

  let clickCounter = 0

  const customEvent = new CustomEvent('get-ids', { detail: {
    callback: setTotalLength,
    target: 'batches'
  }})

  setTimeout(() => {
    document.dispatchEvent(customEvent)
  }, 2000)

  function setTotalLength(ids) {
    nextButton.querySelector('.next-batch-total-counter').textContent = `[${Math.ceil(ids.length / batchSize)}]`
  }

  nextButton.addEventListener('click', () => {    
    document.querySelectorAll('.segment-button').forEach(segment => segment.click())

    viewer.chunkManager.rpc.objects.forEach(obj => {
      if (obj.constructor.name !== 'FragmentSource') return
      if (obj.meshSource.constructor.name !== 'GrapheneMeshSource') return

      obj.chunks.clear()
      obj.meshSource.chunks.clear()
    })

    for (const [mapKey, el] of viewer.chunkManager.memoize.map) {
      if (!el.fragmentSource) continue
      if (el.constructor.name !== 'GrapheneMeshSource') continue

      el.fragmentSource.chunks.clear()
    }

    clickCounter++
    nextButton.querySelector('.next-batch-batch-number').textContent = clickCounter

    const customEvent = new CustomEvent('get-ids', { detail: {
      callback: getCb,
      target: 'batches'
    }})
    document.dispatchEvent(customEvent)

    function getCb(ids) {
      const batch = ids.splice(0, batchSize)

      if (!batch.length) {
        return Dock.dialog({
          id: 'kk-filtering-no-ids',
          html: 'All IDs have been checked',
          destroyAfterClosing: true,
          okLabel: 'OK',
          okCallback: () => {}
        }).show()
      }
      else {
        setTotalLength(ids)
      }

      if (ids.length) {
        setTimeout(() => {
          const nextBatch = ids.slice(0, batchSize)
          Dock.cacheFragments(nextBatch)
        }, 5000)
      }

      const addSegmentsInput = document.querySelector('.add-segment input')
      addSegmentsInput.value = batch.join(',')
      
      const submitEvent = new CustomEvent('submit')
      document.getElementsByClassName('add-segment')[0].dispatchEvent(submitEvent)

      const customEvent = new CustomEvent('remove-ids', { detail: {
        callback: delCb.bind(null, ids),
        target: 'batches'
      }})
      document.dispatchEvent(customEvent)
    }

    function delCb(ids) {
      const customEvent = new CustomEvent('add-ids', { detail: {
        target: 'batches',
        ids: ids
      }})
      document.dispatchEvent(customEvent)
    }
  })
}

function main() {
  document.getElementById('kk-filtering-add-to-storage').addEventListener('click', () => {
    const customEvent = new CustomEvent('add-ids', { detail: {
      target: 'batches',
      ids: getIds()
    }})
    document.dispatchEvent(customEvent)
    document.getElementById('kk-filtering-input').value = ''
  })


  document.getElementById('kk-filtering-save-left').addEventListener('click', e => {
    const ids = []
    const segments = document.querySelectorAll('.segment-button')
    segments.forEach(seg => ids.push(seg.dataset.segId))
    const customEvent = new CustomEvent('add-ids', { detail: {
      target: 'left',
      ids: ids,
      callback: () => {
        segments.forEach(seg => seg.click())
      }
    }})
    document.dispatchEvent(customEvent)
  })
}
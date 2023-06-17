document.addEventListener('dock-ready', () => {
  addCss()
  main()
  addNextButton()
})


if (!document.getElementById('dock-script')) {
  let script = document.createElement('script')
  script.id = 'dock-script'
  script.src = typeof DEV !== 'undefined' ? 'http://127.0.0.1:5501/FlyWire-Dock/Dock.js' : 'https://chrisraven.github.io/FlyWire-Dock/Dock.js'
  document.head.appendChild(script)
}

// on the Next button
function setTotalLength(ids) {
  document.querySelector('#kk-splitter-next-batch-total-counter').textContent = `[${Math.ceil(ids.length / batchSize)}]`
}

function addNextButton() {
  const nextButtonWrapper = document.createElement('div')
  nextButtonWrapper.id = 'kk-splitter-next-wrapper'
  nextButtonWrapper.draggable = true

  const nextButton = document.createElement('button')
  nextButton.id = 'kk-splitter-next-batch'
  nextButton.innerHTML = 'Next (<span id="kk-splitter-next-batch-batch-number">0</span>)<br /><span id="kk-splitter-next-batch-total-counter">[?]</span>'
  nextButton.addEventListener('contextmenu', e => e.preventDefault())

  const saveLeftButton = document.createElement('button')
  saveLeftButton.id = 'kk-splitter-save-left'
  saveLeftButton.textContent = 'Save left'
  saveLeftButton.addEventListener('contextmenu', e => e.preventDefault())

  nextButtonWrapper.appendChild(nextButton)
  nextButtonWrapper.appendChild(saveLeftButton)
  document.body.appendChild(nextButtonWrapper)

  storage.get('kk-splitter-next-button-position').then(res => {
    let top, left
    let position = res['kk-splitter-next-button-position']
    if (!position) {
      top = 300
      left = 300
    }
    else {
      top = position.y
      left = position.x
    }

    nextButtonWrapper.style.top = top + 'px'
    nextButtonWrapper.style.left = left + 'px'
  })

  let clickCounter = 0

  storage.get('kk-splitter-stored').then(res => {
    let ids = res['kk-splitter-stored'] || []
    setTotalLength(ids)
  })

  function refresh() {
    // .querySelectorAll() to create a static NodeList of segments and be able to remove them without any problems
    // .getElementsByClassName() to create a live NodeList and be able to check it changing length
    document.querySelectorAll('.segment-button').forEach(seg => seg.click())
    const segments = document.getElementsByClassName('segment-button')
    setInterval(() => {
      if (!segments.length) {
        localStorage.setItem('clickNext', true)
        setTimeout(() => window.location.reload(), 500)
      }
    }, 100)
  }

  nextButton.addEventListener('click', e => {
    document.querySelectorAll('.segment-button').forEach(segment => segment.click())
    if (clickCounter === refreshEvery) {
      return refresh()
    }
    clickCounter++
    document.getElementById('kk-splitter-next-batch-batch-number').textContent = clickCounter

    storage.get('kk-splitter-stored').then(res => {
      let ids = res['kk-splitter-stored'] || []
      getCb(ids)
    })

    function getCb(ids) {
      const batch = ids.splice(0, batchSize)

      if (!batch.length) {
        return Dock.dialog({
          id: 'kk-splitter-no-ids',
          html: 'All IDs have been checked',
          destroyAfterClosing: true,
          okLabel: 'OK',
          okCallback: () => {}
        }).show()
      }
      else {
        setTotalLength(ids)
        numberOfStored = ids.length
      }

      const addSegmentsInput = document.querySelector('.add-segment input')
      addSegmentsInput.value = batch.join(',')
      
      const submitEvent = new CustomEvent('submit')
      document.getElementsByClassName('add-segment')[0].dispatchEvent(submitEvent)

      storage.set('kk-splitter-stored', ids).then(() => {
        numberOfStored = ids.length
      })
    }
  })
  if (localStorage.getItem('clickNext') === 'true') {
    localStorage.setItem('clickNext', false)
    nextButton.click()
  }

  
  saveLeftButton.addEventListener('click', () => {
    const newIds = []
    const segments = document.querySelectorAll('.segment-button')
    segments.forEach(seg => newIds.push(seg.dataset.segId))
    let ids = []

    if (!newIds || !newIds.length) return

    storage.get('kk-splitter-saved').then(res => {
      ids = res['kk-splitter-saved'] || []
      let batch = newIds.splice(0, 10000)
      do {
      ids.push(...batch)
      batch = newIds.splice(0, 10000)
      }
      while (batch.length > 0)

      storage.set('kk-splitter-saved', ids).then(() => {
        segments.forEach(seg => seg.click())
        numberOfSaved = ids.length
      })
    })
  })

  let initialX, initialY
  let currentX, currentY
  let moving = false

  const nextWrapper = document.getElementById('kk-splitter-next-wrapper')

  nextWrapper.addEventListener('mousedown', e => {
    if (e.button !== 2) return
    e.preventDefault()

    initialX = e.clientX - nextWrapper.offsetLeft
    initialY = e.clientY - nextWrapper.offsetTop
    moving = true
  })

  nextWrapper.addEventListener('mousemove', e => {
    if (!moving) return
    if (e.buttons !== 2) return

    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    nextWrapper.style.left = currentX + 'px';
    nextWrapper.style.top = currentY + 'px';
  })

  nextWrapper.addEventListener('mouseup', e => {
    if (e.button !== 2) return    

    moving = false
    storage.set('kk-splitter-next-button-position', {x: currentX, y: currentY})
  })
}


function getIds(id) {
  let ids = document.getElementById(id).value
  return ids.split(/[ ,\n]+/).map(str => BigInt(str)).filter(num => num !== BigInt(0)) // source: ChatGPT
}


function main() {
  let dock = new Dock()
  storage = window.Sifrr.Storage.getStorage('indexeddb')

  storage.get('kk-splitter-batch-size').then(res => {
    let size = res['kk-splitter-batch-size']
    if (size) {
      batchSize = size
    }
  })

  storage.get('kk-splitter-refresh-every').then(res => {
    let val = res['kk-splitter-refresh-every']
    if (val) {
      refreshEvery = val
    }
  })

  storage.get('kk-splitter-stored').then(res => {
    let stored = res['kk-splitter-stored']
    if (stored) {
      numberOfStored = stored.length
    }
  })

  storage.get('kk-splitter-saved').then(res => {
    let saved = res['kk-splitter-saved']
    if (saved) {
      numberOfSaved = saved.length
    }
  })

  dock.addAddon({
    name: 'Splitter',
    id: 'kk-splitter',
    html: '<button id="kk-splitter-manage">Manage</button>'
  })

  document.getElementById('kk-splitter-manage').addEventListener('click', () => {
    Dock.dialog({
      width: 240,
      id: 'kk-splitter-manage-dialog',
      html: getSplitterDialogHtml(),
      afterCreateCallback: () => {
        setInitialValues()
        addEvents()
      },
      okCallback: () => {},
      okLabel: 'Close',
      destroyAfterClosing: true
    }).show()
  })

  function getSplitterDialogHtml() {
    return /*html*/`
      <textarea id="kk-splitter-input"></textarea>
      <div id="kk-splitter-button-wrapper">
        <button id="kk-splitter-add">Add</button><span id="kk-splitter-batch-size-label">Batch size</span><input id="kk-splitter-batch-size" />
        <div id="kk-splitter-refresh-every-label">Refresh every <input id="kk-splitter-refresh-every" default=100> "Next" clicks</div>
        <button id="kk-splitter-get-stored">Get stored</button>
        <button id="kk-splitter-get-saved">Get saved</button>
        <button id="kk-splitter-clear-stored">Clear stored</button>
        <button id="kk-splitter-clear-saved">Clear saved</button>
        <div class="kk-splitter-counter-label">Number of stored: <span id="kk-splitter-stored-counter" class="kk-splitter-counter">0</span></div>
        <div class="kk-splitter-counter-label">Number of saved: <span id="kk-splitter-saved-counter" class="kk-splitter-counter">0</span></div>
      </div>
    `
  }

  function setStoredCounter(val) {
    document.getElementById('kk-splitter-stored-counter').textContent = val
    numberOfStored =  val
  }

  function setSavedCounter(val) {
    document.getElementById('kk-splitter-saved-counter').textContent = val
    numberOfSaved = val
  }

  function setInitialValues() {
    document.getElementById('kk-splitter-batch-size').value = batchSize
    document.getElementById('kk-splitter-refresh-every').value = refreshEvery
    setStoredCounter(numberOfStored)
    setSavedCounter(numberOfSaved)
  }

  function addEvents() {
    document.getElementById('kk-splitter-batch-size').addEventListener('input', e => {
      const val = parseInt(e.target.value, 10)
      if (isNaN(val)) {
        Dock.dialog({
          id: 'kk-splitter-incorrect-batch-size-dialog',
          html: 'Incorrect value',
          okLabel: 'OK',
          okCallback: () => e.target.value = 20,
          destroyAfterClosing: true
        }).show()
      }
      else {
        batchSize = val
        storage.set('kk-splitter-batch-size', batchSize)
      }
    })

    document.getElementById('kk-splitter-refresh-every').addEventListener('input', e => {
      const val = parseInt(e.target.value, 10)

      if (isNaN(val)) {
        Dock.dialog({
          id: 'kk-splitter-incorrect-refresh-every-dialog',
          html: 'Incorrect value',
          okLabel: 'OK',
          okCallback: () => e.target.value = 20,
          destroyAfterClosing: true
        }).show()
      }
      else {
        refreshEvery = val
        storage.set('kk-splitter-refresh-every', refreshEvery)
      }
    })


    document.getElementById('kk-splitter-add').addEventListener('click', () => {
      const ids = getIds('kk-splitter-input')
      let stored
      storage.get('kk-splitter-stored').then(res => {
        stored = res['kk-splitter-stored'] || []

        let batch = ids.splice(0, 10000)
        do {
        stored.push(...batch)
        batch = ids.splice(0, 10000)
        }
        while (batch.length > 0)

        storage.set('kk-splitter-stored', stored)
      }).then(() => {
        numberOfStored = stored.length
        setStoredCounter(stored.length)
        setTotalLength(stored)
      })

      document.getElementById('kk-splitter-input').value = ''
    })


    document.getElementById('kk-splitter-get-stored').addEventListener('click', () => {
      storage.get('kk-splitter-stored').then(res => {
        const ids = res['kk-splitter-stored'] || []
        navigator.clipboard.writeText(ids.join(',')).then(() => {
          Dock.dialog({
            id: 'kk-splitter-get-stored-dialog',
            html: `Copied ${ids.length} IDs to the clipboard`,
            okLabel: 'OK',
            okCallback: () => {},
            destroyAfterClosing: true
          }).show()
        })
        
      })
    })
  

    document.getElementById('kk-splitter-clear-stored').addEventListener('click', () => {
      Dock.dialog({
        id: 'kk-splitter-clear-stored-confirmation-dialog',
        html: 'Do you really want to clear the stored IDs?',
        okLabel: 'Yes',
        okCallback: okCallback,
        cancelLabel: 'No',
        cancelCallback: () => {},
        destroyAfterClosing: true
      }).show()

      function okCallback() {
        storage.del('kk-splitter-stored').then(() => {
          Dock.dialog({
            id: 'kk-splitter-clear-stored-confirmed-dialog',
            html: 'The stored IDs have been removed',
            okCallback: () => {},
            okLabel: 'OK',
            destroyAfterClosing: true
          }).show()
          setStoredCounter(0)
          setTotalLength([]) // the function expects an array and takes its length, so we're passing an empty array to set the length to 0
        })
      }
    })


    document.getElementById('kk-splitter-get-saved').addEventListener('click', () => {
      storage.get('kk-splitter-saved').then(res => {
        const ids = res['kk-splitter-saved'] || []
        navigator.clipboard.writeText(ids.join(',')).then(() => {
          Dock.dialog({
            id: 'kk-splitter-get-saved-dialog',
            html: `Copied ${ids.length} IDs to the clipboard`,
            okLabel: 'OK',
            okCallback: () => {},
            destroyAfterClosing: true
          }).show()
        })
        
      })
    })
  

    document.getElementById('kk-splitter-clear-saved').addEventListener('click', () => {
      Dock.dialog({
        id: 'kk-splitter-clear-saved-confirmation-dialog',
        html: 'Do you really want to clear the saved IDs?',
        okLabel: 'Yes',
        okCallback: okCallback,
        cancelLabel: 'No',
        cancelCallback: () => {},
        destroyAfterClosing: true
      }).show()

      function okCallback() {
        storage.del('kk-splitter-saved').then(() => {
          Dock.dialog({
            id: 'kk-splitter-clear-saved-confirmed-dialog',
            html: 'The saved IDs have been removed',
            okCallback: () => {},
            okLabel: 'OK',
            destroyAfterClosing: true
          }).show()
          setSavedCounter(0)
        })
      }
    })
  }
}

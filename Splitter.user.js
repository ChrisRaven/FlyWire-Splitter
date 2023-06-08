// ==UserScript==
// @name         Splitter
// @namespace    KrzysztofKruk-FlyWire
// @version      0.1
// @description  Splits large list of IDs to more managable batches
// @author       Krzysztof Kruk
// @match        https://ngl.flywire.ai/*
// @match        https://edit.flywire.ai/*
// @connect      prodv1.flywire-daf.com
// @updateURL    https://raw.githubusercontent.com/ChrisRaven/FlyWire-Splitter/main/Splitter.user.js
// @downloadURL  https://raw.githubusercontent.com/ChrisRaven/FlyWire-Splitter/main/Splitter.user.js
// @homepageURL  https://github.com/ChrisRaven/FlyWire-Splitter
// ==/UserScript==

let storage
let batchSize = 20
let numberOfStored = 0
let numberOfSaved = 0
function addCss() {
  Dock.addCss(/*css*/`
    /* "Next" button */
    #kk-splitter-next-wrapper {
      position: absolute;
      right: 110px;
      bottom: 500px;
      z-index: 10;
      width: 250px;
      height: 90px;
    }

    #kk-splitter-next-batch,
    #kk-splitter-save-left {
      background-color: #449;
      color: orange;
      font-size: 28px;
      border: 1px solid #444;
      cursor: pointer;
    }

    #kk-splitter-next-batch {
      width: 150px;
      height: 90px;
    }

    #kk-splitter-save-left {
      width: 60px;
      height: 90px;
      font-size: 18px;
      position: relative;
      top: 2px;
    }

    #kk-splitter-next-batch:hover,
    #kk-splitter-save-left:hover {
      background-color: #669;
    }

    #kk-splitter-next-batch-total-counter {
      font-size: 12px;
    }

    /* "Manage" dialog */
    #kk-splitter-manage-dialog #kk-splitter-input {
      width: 230px;
      height: 100px;
    }

    #kk-splitter-manage-dialog #kk-splitter-button-wrapper {
      text-align: center;
      margin: 10px;
      width: 220px;
    }

    #kk-splitter-manage-dialog #kk-splitter-batch-size-label {
      display: inline-block;
      font-size: 12px;
      margin: 0 5px 0 26px;
    }

    #kk-splitter-manage-dialog #kk-splitter-batch-size {
      height: 25px;
      width: 25px;
      text-align: center;
    }

    #kk-splitter-manage-dialog #kk-splitter-button-wrapper button {
      margin: 3px;
    }

    #kk-splitter-manage-dialog button#kk-splitter-get-stored,
    #kk-splitter-manage-dialog button#kk-splitter-get-saved,
    #kk-splitter-manage-dialog button#kk-splitter-clear-stored,
    #kk-splitter-manage-dialog button#kk-splitter-clear-saved {
      width: 90px;
    }

    #kk-splitter-manage-dialog button#kk-splitter-clear-stored,
    #kk-splitter-manage-dialog button#kk-splitter-clear-saved {
      background-color: #ef3166;
    }

    #kk-splitter-manage-dialog button#kk-splitter-clear-stored:hover,
    #kk-splitter-manage-dialog button#kk-splitter-clear-saved:hover {
      box-shadow: 0 0 0.5em #f15480;
    }

    .kk-splitter-counter-label {
      font-size: 14px;
      text-align: left;
      margin: 5px 0 5px 25px;
    }

    .kk-splitter-counter {
      color: orange;
    }
  `, 'kk-splitter-css')
}
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


function addNextButton() {
  const nextButtonWrapper = document.createElement('div')
  nextButtonWrapper.id = 'kk-splitter-next-wrapper'

  const nextButton = document.createElement('button')
  nextButton.id = 'kk-splitter-next-batch'
  nextButton.innerHTML = 'Next (<span id="kk-splitter-next-batch-batch-number">0</span>)<br /><span id="kk-splitter-next-batch-total-counter">[?]</span>'

  const saveLeftButton = document.createElement('button')
  saveLeftButton.id = 'kk-splitter-save-left'
  saveLeftButton.textContent = 'Save left'

  nextButtonWrapper.appendChild(nextButton)
  nextButtonWrapper.appendChild(saveLeftButton)
  document.body.appendChild(nextButtonWrapper)

  let clickCounter = 0

  storage.get('kk-splitter-stored').then(res => {
    let ids = res['kk-splitter-stored'] || []
    setTotalLength(ids)
  })

  function setTotalLength(ids) {
    nextButton.querySelector('#kk-splitter-next-batch-total-counter').textContent = `[${Math.ceil(ids.length / batchSize)}]`
  }


  nextButton.addEventListener('click', e => {
    document.querySelectorAll('.segment-button').forEach(segment => segment.click())

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

  
  saveLeftButton.addEventListener('click', () => {
    const newIds = []
    const segments = document.querySelectorAll('.segment-button')
    segments.forEach(seg => newIds.push(seg.dataset.segId))
    let ids = []

    if (!newIds || !newIds.length) return

    storage.get('kk-splitter-saved').then(res => {
      ids = res['kk-splitter-saved'] || []
      ids.push(...newIds)

      storage.set('kk-splitter-saved', ids).then(() => {
        segments.forEach(seg => seg.click())
        numberOfSaved = ids.length
      })
    })
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
  }

  function setSavedCounter(val) {
    document.getElementById('kk-splitter-saved-counter').textContent = val
  }

  function setInitialValues() {
    document.getElementById('kk-splitter-batch-size').value = batchSize
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

    document.getElementById('kk-splitter-add').addEventListener('click', () => {
      const ids = getIds('kk-splitter-input')
      let stored
      storage.get('kk-splitter-stored').then(res => {
        stored = res['kk-splitter-stored'] || []
        stored.push(...ids)
        storage.set('kk-splitter-stored', stored)
      }).then(() => {
        numberOfStored = stored.length
        setStoredCounter(stored.length)
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
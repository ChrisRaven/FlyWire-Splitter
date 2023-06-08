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
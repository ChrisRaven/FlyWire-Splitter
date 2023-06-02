function addCSS() {
  Dock.addCss(/*css*/`
      #kk-filtering-next-batch {
        position: absolute;
        right: 110px;
        bottom: 500px;
        z-index: 10;
        width: 200px;
        height: 90px;
        background-color: #449;
        color: orange;
        font-size: 28px;
        border: 1px solid #444;
        cursor: pointer;
      }

      #kk-filtering-next-batch:hover {
        background-color: #669;
      }

      .next-batch-total-counter {
        font-size: 12px;
      }
  `)
}
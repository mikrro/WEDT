window.NYTADX={},NYTADX.positions=["TopAd","Top5","XXL","Middle1C","HP","Bar1","Box1","Moses","Frame4A","Spon2","Position1","Ribbon","RibbonInterstitial","MiddleRight","MiddleRight1","MiddleRight2","MiddleRight3","MiddleRight4","MiddleRight5","MiddleRight6","MiddleRight7","MiddleRight8","MiddleRight9","MiddleRight10","MiddleRight11","MiddleRight12","MiddleRight13","MiddleRight14","MiddleRight15","TopAd1","MiddleRightN","MostEm","Slideshow_int","Slideshow_end","Anchor","Inv1","ab1","ab2","ab3","prop1","prop2"],function(){var dataElement=document.getElementById("ad-config-data"),adconfig=dataElement?JSON.parse(dataElement.innerHTML).adconfig:{},ledeMediaSize=adconfig.ledeMediaSize,pageLayout=Math.random()<.7?"a":"b",html=document.getElementsByTagName("html")[0],articleToneTag=document.getElementById("article-tone"),articleTone=articleToneTag?articleToneTag.getAttribute("content"):"";html.className+=" has-top-ad",("none"===ledeMediaSize||"small"===ledeMediaSize)&&(pageLayout="a"),"jumbo"===ledeMediaSize&&(pageLayout="b"),"informal"===articleTone&&(pageLayout="a"),("none"===ledeMediaSize||"small"===ledeMediaSize||"large"===ledeMediaSize&&"a"===pageLayout)&&(html.className+=" has-big-ad"),NYTADX.ledeMediaSize=ledeMediaSize,NYTADX.pageLayout=pageLayout,NYTADX.adxKeywords=adconfig.adxKeywords}();
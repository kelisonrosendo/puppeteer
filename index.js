const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // url da coleta
  await page.goto('https://mg.olx.com.br/belo-horizonte-e-regiao/regiao-de-ipatinga/ipatinga/autos-e-pecas/carros-vans-e-utilitarios/vw-volkswagen/fox?q=fox&sf=1');

  const adList = await page.evaluate(() => {

    // remover a tag noscript da página
    var noscript = document.getElementsByTagName('noscript');
    var index = noscript.length;

    while (index--) {
      noscript[index].parentNode.removeChild(noscript[index]);
    }

    // pegar a lista de anúncios
    const nodeList = document.querySelectorAll('#ad-list li.sc-1fcmfeb-2 > a');

    // converter a lista em array
    const adArray = [...nodeList];

    // converter o array em objeto
    const adList = adArray.map(a => ({
      link: a.href,
      img: a.childNodes[0].childNodes[0].childNodes[0].childNodes[0].attributes["data-src"]
        ? a.childNodes[0].childNodes[0].childNodes[0].childNodes[0].attributes["data-src"].value
        : a.childNodes[0].childNodes[0].childNodes[0].childNodes[0].attributes.src.value,
      title: a.childNodes[0].childNodes[1].childNodes[0].childNodes[0].childNodes[0].textContent
    }));

    return adList;
  });

  // gravar a lista em um arquivo json
  fs.writeFile('adList.json', JSON.stringify(adList, null, 2), err => {
    if (err) throw new Error('Algo deu errado :(');
    console.log('Lista gravada com sucesso!');
  });

  await browser.close();
})();
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

//Dépendances internes
const macAddressHelper = require('./helpers/macAddressHelper');
const switchApiHelper = require('./helpers/switchApiHelper');



const listMacAddress = "Exemple de la commande à coller\n\n"+
    "MAC Address   Port  VLAN\n" +
    "  ------------- ----- ----\n" +
    "  00000c-07ac01 1     1\n" +
    "  00908f-9a1128 23    1\n" +
    "  00a2ee-b082f8 2     1\n" +
    "  2cd02d-0109a1 1     1\n" +
    "  484d7e-e41f5b 8     1\n" +
    "  509a4c-8c1164 48    1\n" +
    "  583879-18678d 10    1\n" +
    "  583879-1c5883 8     1\n" +
    "  d89ef3-ef4766 6     1\n" +
    "  e0cbbc-97e39e 3     1\n" +
    "  e0cbbc-97e73b 4     1\n" +
    "  e4b97a-c41f81 5     1\n" +
    "  00000c-07ac02 2     2\n" +
    "  0004f2-a2a4a8 17    2\n" +
    "  00908f-9a10b9 25    2\n" +
    "  00a2ee-b082f8 2     2\n" +
    "  0cd0f8-f4293d 32    2\n" +
    "  2cd02d-0109a1 1     2\n" +
    "  00000c-07ac01 1     10\n" +
    "  00908f-9a10b9 25    10\n" +
    "  00a2ee-b082f8 2     10\n" +
    "  04d6aa-a3ff26 4     10\n" +
    "  0cd0f8-f4293d 32    10\n" +
    "  2cd02d-0109a1 1     10\n" +
    "  787b8a-b05731 34    10\n" +
    "  9801a7-99b559 4     10\n" +
    "  98e0d9-1cfd66 4     10\n" +
    "  e4ce8f-00957a 4     10\n";


dotenv.config();

app.locals.version = process.env.VERSION;

app.set('view engine', 'pug');
//Middlewares
app.use('/static', express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

app.get('/', (req, res) => {

  res.render('index',{list : listMacAddress});
});


app.post('/withoutApi', (req, res) => {

  if (req.body === undefined || req.body.listMacAddress === undefined || req.body.listMacAddress === '') {
    return console.log('La zone de texte doit être renseignée')
  }

  //Récupération du résoultat de la commande sh mac-address
  let manualEntry = req.body.listMacAddress;

  //Traite le copier/coller de la commande show mac-address
  let cleanedMacAddressList = macAddressHelper.cleanManualEntry(manualEntry);

  //Récupére le numéro des ports physiquement branché sur le switch, trié par ordre croissant
  let nbConnectedDevices = macAddressHelper.nbConnectedDevice(cleanedMacAddressList);

  //Tri en fonction du paramètre (vlan, port, constructeur)
  macAddressHelper.sortMacAddressListBy(req.body.sortedBy,cleanedMacAddressList);


  let locals = {
    list: cleanedMacAddressList,
    nbConnectedDevices: nbConnectedDevices,
    sortedBy : req.body.sortedBy
  };

  console.log(req.body.sortedBy);

  res.render('result', locals);

});

app.post('/withApi', async (req, res) => {

  let ipAddress = req.body.ipAddress;
  let portsInfo = await switchApiHelper.getAllActivePortsInfo(ipAddress);

  if(portsInfo !== null) {

    let cleanedMacAddressList = macAddressHelper.processMacAddressList(portsInfo);
    let nbConnectedDevices = macAddressHelper.nbConnectedDevice(cleanedMacAddressList);
    macAddressHelper.sortMacAddressListBy(req.body.sortedBy,cleanedMacAddressList);

    let locals = {
      list: cleanedMacAddressList,
      nbConnectedDevices: nbConnectedDevices,
      sortedBy : req.body.sortedBy,
      switchInfo : await switchApiHelper.getSystemInformation(ipAddress)
    };

    res.render('result', locals);


  } else {
    //TODO A refaire
    res.send(`Impossible de se connecter au switch ${req.body.ipAddress}. Utiliser l'option 2.`);
  }

});

app.all('*',(req,res) => {
  res.redirect('/');
});


app.listen(process.env.SERVER_PORT, function () {
  console.log(`Serveur lancé sur le port ${process.env.SERVER_PORT}.`);
});

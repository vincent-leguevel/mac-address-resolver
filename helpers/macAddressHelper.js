const oui = require('oui');

/**
 * Regex pour la détection des adresses mac
 * @type {RegExp}
 */
const matcher = /(?:[a-fA-F0-9][a-fA-f0-9][:-\s]){1,5}[a-fA-F0-9][a-fA-f0-9]|(?:[a-fA-F0-9][a-fA-F0-9]){3}[:-\s]?(?:[a-fA-F0-9][a-fA-F0-9]){3}/gm;

/**
 * Ajoute les info du constructeur associé à la mac
 * @param jsonPortDetail
 * @returns {json}
 */
module.exports.findManufacturer = function (jsonPortDetail) {


    let manufacturerInfo = oui(jsonPortDetail.macAddress).split('\n');

    jsonPortDetail.manufacturerInfo = {
        manufacturer: manufacturerInfo[0],
        street: manufacturerInfo[1],
        city: manufacturerInfo[2],
        country: manufacturerInfo[3]
    };
    return jsonPortDetail;

};

/**
 * Vérifie s'il s'agit bien d'une adresse mac
 * @param macAddress
 * @returns {boolean}
 */
module.exports.macAddressIsValid = function (macAddress) {

    if(String(macAddress).match(matcher)) return true;
    else {
        console.error('WARNING: '+macAddress+' ignored.');
        return false;
    }

};

/**
 * Trie la liste en fonction du port ou sinon par vlan
 * @param sortedBy
 * @param list
 * @returns {json}
 */
module.exports.sortMacAddressListBy = (sortedBy, list) => {

    if(sortedBy === "port") {
        list.sort((a,b) => {
            return a.port - b.port;
        });
    } else {
        list.sort((a,b) => {
            return a.vlan - b.vlan;
        });
    }

    return list;
};


/**
 * Récupére le numéro des ports physiquement branché sur le switch trié par ordre croissant
 * @param list
 * @returns {Array}
 */
module.exports.nbConnectedDevice = (list) => {

    let nbConnectedDevices = [];
    list.forEach(item => {
        let alreadyExistPort = false;

        nbConnectedDevices.forEach(portID => {
            if(item.port === portID) {
                alreadyExistPort = true;
            }
        });

        if(alreadyExistPort === false) nbConnectedDevices.push(item.port);
    });

    nbConnectedDevices.sort((a,b) => {
        return a-b;
    });

    return nbConnectedDevices;

};


/**
 * Traite le copier/coller de la commande show mac-address
 * @param manualEntry
 * @returns {Array}
 */
module.exports.cleanManualEntry = (manualEntry) => {


    let cleanedMacAddressList = [];
    let list = manualEntry.split('\r\n');

    //Itère sur la liste des mac address en chaine de caractère simple "mac address port  (vlan)"
    list.forEach( itemRow => {
        //Créer un tableau [mac address, port, (vlan)]
        let portDetailRow = itemRow.split(' ');

        //Filtre pour supprimer les espaces dans le tableau
        // La règle test pour chaque item du tableau s'il n'y a pas d'espace ( /\S/ ) grace à la fonction test()
        portDetailRow = portDetailRow.filter(function (str) {
            return /\S/.test(str);
        });

        // Voir regexMacAddress.txt
        if (this.macAddressIsValid(portDetailRow[0])) {

            let jsonPortDetail = {};
            jsonPortDetail.macAddress = portDetailRow[0];

            //Sur certain switch la commande sh mac-address n'affiche pas les vlans associés
            if (portDetailRow.length > 2) {
                jsonPortDetail.vlan = portDetailRow[2];
            }
            jsonPortDetail.port = portDetailRow[1];

            cleanedMacAddressList.push(this.findManufacturer(jsonPortDetail));

        }
    });
    return cleanedMacAddressList;
};

/**
 * Retourne la liste avec les infos du constructeur
 * @param list
 * @returns {Array}
 */
module.exports.processMacAddressList = (list) => {

    let cleanedMacAddressList = [];
    list.forEach(item => {
        let jsonPortDetail = {
            macAddress : item.mac_address,
            port : item.port_id,
            vlan : item.vlan_id
        };

        this.findManufacturer(jsonPortDetail);

        cleanedMacAddressList.push(jsonPortDetail)

    });

    return cleanedMacAddressList;

};

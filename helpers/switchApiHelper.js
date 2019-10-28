const request = require('request-promise');

const API_URL = '/rest/v1/';
const HTTP = 'http://';

//Commandes
const SHOW_MAC_ADDRESS = 'mac-table';
const SYSTEM_INFORMATION = 'system/status';
const SHOW_VLANS = 'vlans'

/**
 * Retoune unz liste des ports actifs sur le switch
 * @param ipAddress
 * @returns {Promise<null>}
 */
module.exports.getAllActivePortsInfo = async (ipAddress) => {

    let activePortsInfo = {};

    let urlOptions = {
        url : HTTP + ipAddress + API_URL + SHOW_MAC_ADDRESS,
        json: true
    };

    try{
        activePortsInfo = await request(urlOptions);
        if(activePortsInfo['mac-table']) {
            return activePortsInfo['mac-table'];
        }
        else if(activePortsInfo['mac_table_entry_element']) {
            return activePortsInfo['mac_table_entry_element'];
        }

    }catch (e) {
        console.error(e);
        return null;
    }

};


/**
 * Retourne les informations du switch
 * @param ipAddress
 * @returns {Promise<null>}
 */
module.exports.getSystemInformation = async (ipAddress) => {

    let info = {};

    let urlOptions = {
        url : HTTP + ipAddress + API_URL + SYSTEM_INFORMATION,
        json: true
    };

    try{
        info = await request(urlOptions);
        console.log(info);
        return info;
    }catch (e) {
        console.error(e);
        return null;
    }

};

module.exports.getVlansInformation = async (ipAddress) => {

    let vlansInfo = {};

    let urlOptions = {
        url : HTTP + ipAddress + API_URL + SHOW_VLANS,
        json: true
    };

    try {
        vlansInfo = await request(urlOptions);
        console.log(vlansInfo);
        return vlansInfo;
    } catch (e) {
        console.error(e);
        return null;
    }

};
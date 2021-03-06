/* eslint-disable no-undef, no-unused-vars */

const fs = require('fs');
const path = require('path');

const config = require('../config')();

const rootFolder = process.cwd();
const componentPath = path.join(config.appFolder, config.componentsFolder);


function getData(componentName) {
    let data = {};
    let jsonComp = path.join(
        rootFolder,
        componentPath,
        componentName,
        `${componentName}.json`
    )

    if(!fs.existsSync(jsonComp)) {
        jsonComp = path.join(
            rootFolder,
            componentPath,
            componentName,
            `${componentName}.json`
        )
    }

    if(fs.existsSync(jsonComp)) {
        data = require(jsonComp);
        purgeCache(jsonComp);
        let jsonString = JSON.stringify(data);
        let res = jsonString.replace(/"###(.*?)###"/g, function(org, catched) {
            let subData = JSON.stringify(getData(catched));
            return subData;
        });

        data = JSON.parse(res);
    }

    return data;
}

/* eslint-disable */
// Removes cached json
// Taken from http://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate
function purgeCache(moduleName) {
    // Traverse the cache looking for the files
    // loaded by the specified module name
    searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 */
function searchCache(moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function traverse(mod) {
            // Go over each of the module's children and
            // traverse them
            mod.children.forEach(function (child) {
                traverse(child);
            });

            // Call the specified callback providing the
            // found cached module
            callback(mod);
        }(mod));
    }
};
/* eslint-enable */

module.exports = {
    getData,
}

/* eslint-enable no-undef, no-unused-vars */

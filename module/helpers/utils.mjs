function getValueByPath(obj, path) {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

function getMissions(missions) {
    return missions.split(',')                    // Split by comma
            .map(num => num.trim())        // Trim spaces
            .map(num => Number(num))       // Convert to Number
            .filter(num => !isNaN(num));
}

export {getValueByPath, getMissions};

const {ipcRenderer} = require("electron");
const electron = require('electron');

// Importing the net Module from electron remote
const net = electron.remote.net;

// CONSTANTS
const BASE_API_URL = "/rest/api/2/";

/**
 * Log into Jira
 * @param {*} jiraUrl 
 * @param {*} email 
 * @param {*} token 
 */
const login = (jiraUrl, email, token) => {
    const request = buildGetRequest(
        jiraUrl, 
        email, 
        token, 
        `${BASE_API_URL}issue/createmeta`
    );

    request.on('response', (response) => {
        response.on('data', (chunk) => {
            // Nothing to do
        });
    });
    request.on('error', (error) => {
        ipcRenderer.send("error-sent", error);
    });

    request.end();
};

/**
 * Retrieves the result of a given filter
 * @param {*} jiraUrl 
 * @param {*} email 
 * @param {*} token 
 * @param {*} filterId 
 */
const getFilterResults = (jiraUrl, email, token, filterId) => {
    const request = buildGetRequest(
        jiraUrl, 
        email, 
        token, 
        `${BASE_API_URL}search?jql=filter=${filterId}`
    );

    request.on('response', (response) => {
        response.on('data', (chunk) => {

            let resultArray = [];
            
            const json = JSON.parse(chunk);

            // If an error message is found, return an error
            if(json.errorMessages) {
                sendJiraErrorMessages(json.errorMessages);
                return;
            }

            // Process issues
            for(const issue of json.issues) {
                resultArray.push({
                    id: issue.key,
                    name: issue.fields.summary,
                    type: issue.fields.issuetype.name,
                    project: issue.fields.project.name,
                    epic: issue.fields.customfield_10014 || ""
                });
            }

            ipcRenderer.send("jira-filter-response-sent", resultArray);
        });
    });
    request.on('error', (error) => {
        ipcRenderer.send("error-sent", error);
    });

    request.end();
}

/**
 * Retrieves the worklog of a card
 * @param {*} jiraUrl 
 * @param {*} email 
 * @param {*} token 
 * @param {*} cardId 
 */
const getCardWorklog = (jiraUrl, email, token, cardId) => {
    const request = buildGetRequest(
        jiraUrl, 
        email, 
        token, 
        `${BASE_API_URL}issue/${cardId}/worklog`
    );

    request.on('response', (response) => {
        response.on('data', (chunk) => {

            let resultArray = [];
            
            const json = JSON.parse(chunk);

            // If an error message is found, return an error
            if(json.errorMessages) {
                sendJiraErrorMessages(json.errorMessages);
                return;
            }

            // Process worklogs
            for(const worklog of json.worklogs) {
                // Get current & next years & months
                const date = new Date();
                const currentYear = date.getFullYear();
                const currentMonth = formatMonth(date.getMonth() + 1);
                const nextYear = (currentMonth != 12) ? currentYear : currentYear + 1;
                const nextMonth = formatMonth((currentMonth != 12) ? Number(currentMonth) + 1 : 1);
                const startOfCurrentMonth = `${currentYear}-${currentMonth}-01`;
                const startOfNextMonth = `${nextYear}-${nextMonth}-01`;

                if(
                    `${startOfCurrentMonth}` <= worklog.started && 
                    worklog.started <= `${startOfNextMonth}`
                ) {
                    // Calculate the time spent on the card
                    let timeSpent = 0;
                    let timeSpentSeconds = worklog.timeSpentSeconds;
                    while(timeSpentSeconds > 0) {
                        // Remove 2 hours from the total time spent in seconds
                        timeSpentSeconds-=7200;
                        // Add 2 hours to the time spent in days
                        timeSpent+=25;
                    }
                    timeSpent = timeSpent/100;

                    // Returns the result
                    resultArray.push({
                        cardId: cardId,
                        author: worklog.author.displayName,
                        started: worklog.started,
                        timeSpent: timeSpent,
                        timeSpentSeconds: worklog.timeSpentSeconds
                    });
                }
            }

            ipcRenderer.send("jira-card-worklog-response-sent", resultArray);
        });
    });
    request.on('error', (error) => {
        ipcRenderer.send("error-sent", error);
    });

    request.end();
}

/**
 * Builds a GET request
 * 
 * @param {*} jiraUrl 
 * @param {*} email 
 * @param {*} token 
 * @param {*} path 
 * @returns a GET request
 */
const buildGetRequest = (jiraUrl, email, token, path) => {
    const {protocol, hostname} = splitProtocolAndHostname(jiraUrl);

    const request = net.request({
        method: 'GET',
        protocol: `${protocol}`,
        hostname: `${hostname}`,
        path: `${path}`
    });
    
    request.setHeader('Authorization', `Basic ${
        Buffer.from(`${email}:${token}`).toString('base64')
    }`);

    return request
}

/**
 * Formats months < 10 with a 0
 * @param {*} month 
 * @returns 
 */
const formatMonth = (month) => {
    return (month < 10) ? `0${month}` : month;
}

/**
 * Sends all the error messages to the IPC Main
 * @param {*} errorMessages 
 */
const sendJiraErrorMessages = (errorMessages) => {
    let errors = "";
    for(const message of errorMessages) {
        errors += message + "<br/>";
    }
    ipcRenderer.send("error-sent", errors);
}

/**
 * Gets an url and splits its protocol (HTTP, HTTPS) and its hostname
 * @param {*} url 
 * @returns an object having {protocol: ..., hostname: ...}
 */
const splitProtocolAndHostname = (url) => {
    let protocol = "";
    let hostname = "";

    if(url.indexOf("//") > -1) {
        let splittedUrl = url.split("//");
        protocol = splittedUrl[0];
        hostname = splittedUrl[1];
    } else {
        protocol = "http:",
        hostname = url
    }

    return {
        protocol: protocol,
        hostname: hostname
    }
}

module.exports = {
    "login": login,
    "getFilterResults": getFilterResults,
    "getCardWorklog": getCardWorklog
}
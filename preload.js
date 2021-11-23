const JiraService = require("./app/services/JiraService");
const AggregationService = require("./app/services/AggregationService");
const {contextBridge, ipcRenderer} = require("electron");

// Expose IPC Renderer
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        receive: (channel, func) => {
            ipcRenderer.on(channel, func);
        }
    }
);

// Expose JiraService
contextBridge.exposeInMainWorld(
    "jiraService", {
        login: (jiraUrl, email, token) => {
            JiraService.login(jiraUrl, email, token)
        },
        getFilterResults: (jiraUrl, email, token, filterId) => {
            JiraService.getFilterResults(jiraUrl, email, token, filterId)
        },
        getCardWorklog: (jiraUrl, email, token, cardId) => {
            JiraService.getCardWorklog(jiraUrl, email, token, cardId)
        }
    }
);

// Expose AggregationService
contextBridge.exposeInMainWorld(
    "aggregationService", {
        aggregate: (worklogResults) => {
            AggregationService.aggregate(worklogResults)
        }
    }
);
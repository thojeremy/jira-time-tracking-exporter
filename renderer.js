// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

// Constant variable with filter results
let FILTER_RESULTS = [];
let WORKLOG_RESULTS = [];

// ==========
// 
// Functions
// 
// ==========
/**
 * Enables all UI Elements
 */
const enableUiElements = () => {
    enableUrlField();
    enableEmailField();
    enableTokenField();
    enableFilterIdField();

    enableGenerateButton();
    enableAggregateButton();
};
const enableUrlField = () => {
    const elt = document.getElementById("url");
    if(elt) {
        elt.disabled = false;
    }
};
const enableEmailField = () => {
    const elt = document.getElementById("email");
    if(elt) {
        elt.disabled = false;
    }
};
const enableTokenField = () => {
    const elt = document.getElementById("token");
    if(elt) {
        elt.disabled = false;
    }
};
const enableFilterIdField = () => {
    const elt = document.getElementById("filterId");
    if(elt) {
        elt.disabled = false;
    }
};
const enableGenerateButton = () => {
    const elt = document.getElementById("generateButton");
    if(elt) {
        elt.disabled = false;
    }
};
const enableAggregateButton = () => {
    const elt = document.getElementById("aggregateButton");
    if(elt) {
        elt.disabled = false;
    }
};

// Disables all UI elements
const disableUiElements = () => {
    disableUrlField();
    disableEmailField();
    disableTokenField();
    disableFilterIdField();

    disableGenerateButton();
    disableAggregateButton();
};
const disableUrlField = () => {
    const elt = document.getElementById("url");
    if(elt) {
        elt.disabled = true;
    }
};
const disableEmailField = () => {
    const elt = document.getElementById("email");
    if(elt) {
        elt.disabled = true;
    }
};
const disableTokenField = () => {
    const elt = document.getElementById("token");
    if(elt) {
        elt.disabled = true;
    }
};
const disableFilterIdField = () => {
    const elt = document.getElementById("filterId");
    if(elt) {
        elt.disabled = true;
    }
};
const disableGenerateButton = () => {
    const elt = document.getElementById("generateButton");
    if(elt) {
        elt.disabled = true;
    }
};
const disableAggregateButton = () => {
    const elt = document.getElementById("aggregateButton");
    if(elt) {
        elt.disabled = true;
    }
};

/**
 * Retrieves the connection elements as defined by the user
 * @returns 
 */
const getConnectionElements = () => {
    return {
        url: document.getElementById("url").value,
        email: document.getElementById("email").value,
        token: document.getElementById("token").value,
        filterId: document.getElementById("filterId").value
    }
};

/**
 * Hides the loading text
 */
const hideLoading = () => {
    const loading = document.getElementById("loading");
    if(loading) {
        loading.hidden = true;
    }
};

/**
 * Resets the error message
 */
const resetErrorMessage = () => {
    const errorText = document.getElementById("error");
    if(errorText) {
        errorText.innerHTML = "";
    }
};

/**
 * Resets the result table
 */
const resetResultTable = () => {
    const resultTable = document.getElementById("resultTable");
    if(resultTable) {
        resultTable.innerHTML = "\
            <tr>\
                <th>Card ID</th>\
                <th>Card Name</th>\
                <th>Card Type</th>\
                <th>Project</th>\
                <th>Epic</th>\
                <th>Author</th>\
                <th>Started At</th>\
                <th>Time Spent (in days)</th>\
                <th>Time Spent (in seconds)</th>\
            </tr>\
        ";
    }
};

/**
 * Resets the result table to display the aggregation
 */
const resetResultTableForAggregation = () => {
    const resultTable = document.getElementById("resultTable");
    if(resultTable) {
        resultTable.innerHTML = "\
            <tr class='table-supertitle'>\
                <th>Author</th>\
                <th>Card</th>\
                <th>Project</th>\
                <th>Epic</th>\
                <th>Time Spent (in days)</th>\
            </tr>\
        ";
    }
}

/**
 * Shows the loading text
 */
const showLoading = () => {
    const loading = document.getElementById("loading");
    if(loading) {
        loading.hidden = false;
    }
};

// ==================
//
// Process execution
//
// ==================
resetResultTable();
hideLoading();

// ===================
// 
// Setup UI listeners
// 
// ===================
// Generate button
const generateButton = document.getElementById('generateButton');
if(generateButton){
    generateButton.addEventListener('click', function(){
        // Reset elements
        resetResultTable();
        resetErrorMessage();
        FILTER_RESULTS = [];
        WORKLOG_RESULTS = [];

        // UI actions
        showLoading();
        disableUiElements();

        // Retrieve connection elements
        const {url, email, token, filterId} = getConnectionElements();

        // Call Jira
        window.jiraService.login(url, email, token);
        window.jiraService.getFilterResults(url, email, token, filterId);
    });
}

// Aggregate button
const aggregateButton = document.getElementById('aggregateButton');
if(aggregateButton){
    aggregateButton.addEventListener('click', function(){
        resetResultTableForAggregation();

        aggregationService.aggregate(WORKLOG_RESULTS);
    });
}

// ===================
//
// Setup IPC renderer
//
// ===================
window.api.receive("error-answer", (event, data) => {
    const errorText = document.getElementById("error");
    if(errorText) {
        errorText.innerHTML = data;

        FILTER_RESULTS = [];
        WORKLOG_RESULTS = [];

        hideLoading();
        enableUiElements();
        disableAggregateButton();
    }
});

window.api.receive("jira-filter-answer", (event, data) => {
    // Retrieve connection elements
    const {url, email, token} = getConnectionElements();

    FILTER_RESULTS = data;

    for(const card of data) {
        window.jiraService.getCardWorklog(url, email, token, card.id);
    }
});

window.api.receive("jira-card-worklog-answer", (event, data) => {
    const resultTable = document.getElementById("resultTable");

    if(resultTable){
        for(const worklog of data) {
            const associatedCard = FILTER_RESULTS.filter(elt => elt.id === worklog.cardId)[0];
            
            WORKLOG_RESULTS.push({
                id: associatedCard.id,
                name: associatedCard.name,
                project: associatedCard.project,
                epic: associatedCard.epic,
                author: worklog.author,
                timeSpent: worklog.timeSpent
            });

            resultTable.innerHTML = `
                ${resultTable.innerHTML}
                <tr>
                    <td>${associatedCard.id}</td>
                    <td>${associatedCard.name}</td>
                    <td>${associatedCard.type}</td>
                    <td>${associatedCard.project}</td>
                    <td>${associatedCard.epic}</td>
                    <td>${worklog.author}</td>
                    <td>${worklog.started}</td>
                    <td>${worklog.timeSpent}</td>
                    <td>${worklog.timeSpentSeconds}</td>
                </tr>
            `;

        }

        hideLoading();
        enableUiElements();
    }
});

window.api.receive("aggregate-answer", (event, data) => {
    const resultTable = document.getElementById("resultTable");

    if(resultTable){
        for(const authors of data) {

            resultTable.innerHTML = `
                ${resultTable.innerHTML}
                <tr class="table-subtitle">
                    <th>${authors.author}</th>
                    <th>(Total: ${authors.total})</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            `;

            authors.cards.forEach(card => {
                resultTable.innerHTML = `
                    ${resultTable.innerHTML}
                    <tr class="table-subpart">
                        <td></td>
                        <td>${card.id}: ${card.name}</td>
                        <td>${card.project}</td>
                        <td>${card.epic}</td>
                        <td>${card.timeSpent}</td>
                    </tr>
                `;
            });

        }
    }
});
const {ipcRenderer} = require("electron");

/**
 * Aggregates worklog results to display time spent on cards for a user
 * @param {*} worklogResults 
 * @returns 
 */
const aggregate = (worklogResults) => {
    let authors = getAuthors(worklogResults);
    let deduplicatedCards = getDeduplicatedCards(worklogResults);

    let result = aggregateByAuthor(authors, deduplicatedCards);

    ipcRenderer.send("aggregate-sent", result);
}

/**
 * Aggregates the de-duplicated cards BY author
 * @param {*} authors 
 * @param {*} deduplicatedCards 
 * @returns a dictionnary as :
 *  {
 *      "author": ...,
 *      "total": ...,
 *      "cards": [
 *          {
 *              "id": ...,
 *              "name": ...,
 *              "project": ...,
 *              "epic": ...,
 *              "timeSpent": ...
 *          }
 *      ]
 *  }
 */
const aggregateByAuthor = (authors, deduplicatedCards) => {
    let result = [];
    
    for(const author of authors) {
        const cards = deduplicatedCards.filter(card => card.author == author);
        
        let total = 0;
        cards.forEach(card => {
            total += card.timeSpent;
        })

        result.push({
            author: author,
            total: total,
            cards: cards
        });
    }

    return result;
}

/**
 * Get distinct authors
 * @param {*} worklogResults 
 * @returns 
 */
const getAuthors = (worklogResults) => {
    let authors = worklogResults.map(elt => elt.author);
    return Array.from(new Set(authors));
}

/**
 * De-duplicates cards on CARD ID and AUTHOR ID
 * @param {*} worklogResults 
 * @returns 
 */
const getDeduplicatedCards = (worklogResults) => {
    let deduplicatedCards = [];

    for(worklog of worklogResults) {
        if(isWorklogInDeduplicatedCards(worklog, deduplicatedCards)){
            deduplicatedCards
                .filter (elt => 
                            elt.id == worklog.id && 
                            elt.author == worklog.author
                        )[0]
                .timeSpent += worklog.timeSpent;
        } else {
            deduplicatedCards.push(worklog);
        }
    }

    return deduplicatedCards;
}

/**
 * Checks if the worklog is already in the deduplicated cards array
 * @param {*} worklog 
 * @param {*} deduplicatedCards 
 * @returns 
 */
const isWorklogInDeduplicatedCards = (worklog, deduplicatedCards) => {
    return  deduplicatedCards
                .filter(elt => 
                            elt.id == worklog.id && 
                            elt.author == worklog.author
                )
                .length > 0;
}

module.exports = {
    "aggregate": aggregate
}
let db;
const request = indexedDB.open("budget", 1)
request.onupgradeneeded = ({target}) => {
    let db = target.results;
    db.createObjectStore("pending", {
        autoIncrement: true
    })
} 

request.onerror = function(e) {
    console.log("There was an error", e.target.errorCode);
  };
  
request.onsuccess = function(e) {
    db = e.target.results;
    if (navigator.onLine){
        updateDatabase();
    }
}
function updateDatabase(){
    const transaction = db.transaction(["pending"], "rewrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getall();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                            "Content-Type": "application/json"
                }
            }).then(response => {
                return response.json()
            }).then(() => {
                const transaction = db.transaction(["pending"], "rewrite");
                const store = transaction.objectStore("pending");
                store.clear();
            }) 
        }
    }
}
function saveRecord(trans){
    const transaction = db.transaction(["pending"], "rewrite");
    const store = transaction.objectStore("pending");
    store.add(trans);
}
window.addEventListener(onLine, updateDatabase) 
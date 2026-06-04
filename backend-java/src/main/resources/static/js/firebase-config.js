// firebase-config.js - Firebase configuration and Simulation Fallback

// REPLACE THIS WITH YOUR REAL FIREBASE CONFIGURATION IF DESIRED
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// Check if Firebase config is filled in
const isRealFirebase = firebaseConfig.apiKey && firebaseConfig.apiKey.trim() !== "";

let dbInstance = null;
let authInstance = null;

if (isRealFirebase) {
    console.log("MediSwift: Initializing real Firebase services...");
    try {
        // Import Firebase SDKs dynamically if they exist
        firebase.initializeApp(firebaseConfig);
        dbInstance = firebase.database();
        authInstance = firebase.auth();
    } catch (e) {
        console.error("Firebase SDK load failed. Falling back to simulation.", e);
        initializeSimulator();
    }
} else {
    console.log("MediSwift: Firebase configuration not set. Initializing Local Simulation Fallback...");
    initializeSimulator();
}

function initializeSimulator() {
    window.isFirebaseSimulated = true;
    
    // Simple simulated database (in-memory & localStorage)
    const simulatedDB = {
        ref: function(path) {
            return {
                set: function(data) {
                    localStorage.setItem(`db_${path}`, JSON.stringify(data));
                    // Fire callbacks
                    triggerCallbacks(path, data);
                    return Promise.resolve();
                },
                update: function(data) {
                    let current = localStorage.getItem(`db_${path}`);
                    let obj = current ? JSON.parse(current) : {};
                    Object.assign(obj, data);
                    localStorage.setItem(`db_${path}`, JSON.stringify(obj));
                    triggerCallbacks(path, obj);
                    return Promise.resolve();
                },
                once: function(event, callback) {
                    let data = localStorage.getItem(`db_${path}`);
                    callback({
                        val: () => data ? JSON.parse(data) : null
                    });
                },
                on: function(event, callback) {
                    if (!window.dbCallbacks) window.dbCallbacks = {};
                    if (!window.dbCallbacks[path]) window.dbCallbacks[path] = [];
                    window.dbCallbacks[path].push(callback);
                    
                    // Call initially
                    let data = localStorage.getItem(`db_${path}`);
                    callback({
                        val: () => data ? JSON.parse(data) : null
                    });
                },
                off: function() {
                    if (window.dbCallbacks && window.dbCallbacks[path]) {
                        delete window.dbCallbacks[path];
                    }
                },
                push: function(data) {
                    const newId = 'sim_' + Date.now();
                    const newPath = `${path}/${newId}`;
                    localStorage.setItem(`db_${newPath}`, JSON.stringify(data));
                    return {
                        key: newId,
                        set: (d) => {
                            localStorage.setItem(`db_${newPath}`, JSON.stringify(d));
                            return Promise.resolve();
                        }
                    };
                }
            };
        }
    };

    function triggerCallbacks(path, data) {
        if (window.dbCallbacks && window.dbCallbacks[path]) {
            window.dbCallbacks[path].forEach(cb => {
                cb({ val: () => data });
            });
        }
        // Also support sub-paths trigger if needed
        Object.keys(window.dbCallbacks || {}).forEach(k => {
            if (k.startsWith(path + '/')) {
                let subKey = k.replace(path + '/', '');
                let subData = data ? data[subKey] : null;
                window.dbCallbacks[k].forEach(cb => {
                    cb({ val: () => subData });
                });
            }
        });
    }

    // Simple simulated authentication
    const simulatedAuth = {
        currentUser: null,
        callbacks: [],
        
        onAuthStateChanged: function(callback) {
            this.callbacks.push(callback);
            // Retrieve session from localStorage
            let storedUser = sessionStorage.getItem("sim_user");
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
            }
            callback(this.currentUser);
            return () => {
                this.callbacks = this.callbacks.filter(c => c !== callback);
            };
        },
        
        createUserWithEmailAndPassword: function(email, password, role = "customer") {
            return new Promise((resolve, reject) => {
                if (!email || !password) {
                    reject(new Error("Email and password are required."));
                    return;
                }
                
                // Save user list
                let users = JSON.parse(localStorage.getItem("sim_users") || "{}");
                if (users[email]) {
                    reject(new Error("Email already registered in simulation."));
                    return;
                }
                
                users[email] = { email, password, role };
                localStorage.setItem("sim_users", JSON.stringify(users));
                
                const user = { email, uid: "usr_" + btoa(email), role };
                this.currentUser = user;
                sessionStorage.setItem("sim_user", JSON.stringify(user));
                
                this.callbacks.forEach(cb => cb(user));
                resolve({ user });
            });
        },
        
        signInWithEmailAndPassword: function(email, password) {
            return new Promise((resolve, reject) => {
                let users = JSON.parse(localStorage.getItem("sim_users") || "{}");
                let userRecord = users[email];
                
                if (userRecord && userRecord.password === password) {
                    const role = userRecord.role || "customer";
                    const user = { email, uid: "usr_" + btoa(email), role };
                    this.currentUser = user;
                    sessionStorage.setItem("sim_user", JSON.stringify(user));
                    this.callbacks.forEach(cb => cb(user));
                    resolve({ user });
                } else {
                    reject(new Error("Invalid email or password."));
                }
            });
        },
        
        signOut: function() {
            return new Promise((resolve) => {
                this.currentUser = null;
                sessionStorage.removeItem("sim_user");
                this.callbacks.forEach(cb => cb(null));
                resolve();
            });
        }
    };

    dbInstance = simulatedDB;
    authInstance = simulatedAuth;
}

// Export database and auth instances globally
window.firebaseDB = dbInstance;
window.firebaseAuth = authInstance;

/**
 * ChatStore - IndexedDB persistence for chat transcripts
 * 
 * Provides resilient storage that survives page reloads and tab crashes.
 * Uses browser's native IndexedDB API with no external dependencies.
 */

type Message = {
  role: "user" | "assistant";
  content: string;
};

const DB_NAME = "os1_chat_db";
const STORE_NAME = "transcripts";
const KEY = "messages";
const DB_VERSION = 1;

/**
 * Open or create the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Save chat messages to IndexedDB
 */
async function save(messages: Message[]): Promise<void> {
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(messages, KEY);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to save messages"));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("[ChatStore] Save failed:", error);
    throw error;
  }
}

/**
 * Load chat messages from IndexedDB
 */
async function load(): Promise<Message[]> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY);

      request.onsuccess = () => {
        const messages = request.result || [];
        resolve(messages);
      };

      request.onerror = () => {
        reject(new Error("Failed to load messages"));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("[ChatStore] Load failed:", error);
    return []; // Return empty array on failure
  }
}

/**
 * Clear all chat messages from IndexedDB
 */
async function clear(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(KEY);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error("Failed to clear messages"));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("[ChatStore] Clear failed:", error);
    throw error;
  }
}

/**
 * Export ChatStore interface
 */
export const ChatStore = {
  save,
  load,
  clear,
};

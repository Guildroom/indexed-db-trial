import { version } from "./iniDb"

export const addData = (storeName, data) => {
    return new Promise(resolve => {
      const request = indexedDB.open("myDB", version)
  
      request.onsuccess = () => {
        console.log("request.onsuccess - addData", data)
        const db = request.result
        const tx = db.transaction(storeName, "readwrite")
        const store = tx.objectStore(storeName)
        store.add(data)
        resolve(data)
      }
  
      request.onerror = () => {
        const error = request.error?.message
        if (error) {
          resolve(error)
        } else {
          resolve("Unknown error")
        }
      }
    })
  }

export const getStoreData = storeName => {
    return new Promise(resolve => {
      const request = indexedDB.open("myDB")
  
      request.onsuccess = () => {
        console.log("request.onsuccess - getAllData")
        const db = request.result
        const tx = db.transaction(storeName, "readonly")
        const store = tx.objectStore(storeName)
        const res = store.getAll()
        res.onsuccess = () => {
          resolve(res.result)
        }
      }
    })
  }
  
export const deleteData = (storeName, key) => {
  return new Promise(resolve => {
    const request = indexedDB.open("myDB", version)
  
    request.onsuccess = () => {
      console.log("request.onsuccess - deleteData", key)
      const db = request.result
      const tx = db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)
      const res = store.delete(key)
  
      res.onsuccess = () => {
        resolve(true)
      }
      res.onerror = () => {
        resolve(false)
      }
    }
  })
}

export const updateData = (storeName, key) => {
  return new Promise(resolve => {
    const request = indexedDB.open("myDB", version)
  
    request.onsuccess = () => {
      console.log("request.onsuccess - updateData", key)
      const db = request.result
      const tx = db.transaction(storeName, "readwrite")
      const store = tx.objectStore(storeName)
      const res = store.get(key)
      res.onsuccess = () => {
        resolve(true)
        console.log(res.result)
      }
      res.onerror = () => {
        resolve(false)
      }
    }
  })
}
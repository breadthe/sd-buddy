import { derived, writable } from "svelte/store";
import { QueueItemStatus, type Queue, type QueueItem } from "../types";

// Use this in lieu of an event bus to fire a signal to the queue to start/stop processing
export const startQueue = writable<boolean>(false)
export const stopQueue = writable<boolean>(false)

// queue is being processed
export const queueIsProcessing = writable<boolean>(false)

// is the queue UI expanded or collapsed?
export const queueIsExpanded = writable<boolean>(false)

function createQueueStore() {
    // let storedQueue = JSON.parse(localStorage.getItem("queue")) || [];
    let storedQueue = localStorage.getItem("queue") ? JSON.parse(localStorage.getItem("queue")) : [];
    const { subscribe, set } = writable(storedQueue);

    return {
        subscribe,
        set: (queueJson: string) => {
            localStorage.setItem("queue", JSON.stringify(queueJson));
        },
        push: (queueItem: QueueItem) => {
            const newQueue = storedQueue;

            newQueue.push(queueItem);

            storedQueue = newQueue;
            localStorage.setItem("queue", JSON.stringify(storedQueue));
            set(storedQueue);
        },
        remove: async (id: string) => {
            const ix = storedQueue.findIndex((qi: QueueItem) => qi.id === id);
            console.log("remove storedQueue", storedQueue)
            console.log("remove", ix) // why is this -1?
            if (ix > -1) {
                console.log("removing", id);
                storedQueue.splice(ix, 1);

                storedQueue = storedQueue;
                localStorage.setItem("queue", JSON.stringify(storedQueue));
                set(storedQueue);
            }
        },
        toggleSkip: (id: string) => {
            const ix = storedQueue.findIndex((qi: QueueItem) => qi.id === id);
            if (ix > -1) {
                storedQueue[ix].status = storedQueue[ix].status === QueueItemStatus.Skipped ? QueueItemStatus.Pending : QueueItemStatus.Skipped

                storedQueue = storedQueue;
                localStorage.setItem("queue", JSON.stringify(storedQueue));
                set(storedQueue);
            }
        },
        updateStatus: async (id: string, status: QueueItemStatus) => {
            const ix = storedQueue.findIndex((qi: QueueItem) => qi.id === id);
            console.log("updateStatus storedQueue", storedQueue)
            console.log("updateStatus", ix);
            if (ix > -1) {
                console.log("updating status", id, status);
                storedQueue[ix].status = status

                storedQueue = storedQueue;
                localStorage.setItem("queue", JSON.stringify(storedQueue));
                set(storedQueue);
            }
        },
        clearCompleted: () => {
            const incompleteQueue = storedQueue.filter((qi: QueueItem) => qi.status !== QueueItemStatus.Completed)

            storedQueue = incompleteQueue
            localStorage.setItem("queue", JSON.stringify(storedQueue))
            set(storedQueue)
        },
        clear: () => {
            storedQueue = [];

            localStorage.setItem("queue", JSON.stringify([]));
            set(storedQueue);
        },
    };
}
export const queue = createQueueStore()

// derived queue store that filters out completed items
export const incompleteQueue = derived(queue, $queue => {
    return $queue.filter((qi: QueueItem) => qi.status !== QueueItemStatus.Completed)
})

// derived queue store that returns the item currently being processed
export const currentQueueItem = derived(queue, $queue => {
    return $queue.find((qi: QueueItem) => qi.status === QueueItemStatus.Running)
})

document.querySelector('.todoInput').addEventListener("keydown", (e) => {
    if (e.code === 'Enter') {
        addTask();
    }
});

document.querySelector(".addButton").addEventListener("click", addTask);

async function localStorageGetTasks() {
    let tasksArr;
    await chrome.storage.local.get("tasks")
        .then(tasks => {
            tasksArr = JSON.parse(tasks["tasks"] || "[]");
        });
    return tasksArr;
}

async function addTask() {
    let input = document.querySelector("input[type='text']").value;
    if (input != "") {
        localStorageGetTasks().then(t => {
            t.push({ "item": input, "status": 0 });
            registerTasks(t);
            getTasks();
            document.querySelector("input[type='text']").value = "";
            document.querySelector('div .hidden').style.display = "none";

        }).catch(e => console.log(e));
    }
}

async function getTasks() {
    const ul = document.querySelector("#taskList");
    ul.innerHTML = '';
    let newTask = "";
    localStorageGetTasks().then(tasksArr => {
        if (tasksArr.length < 1) document.querySelector('div .hidden').style.display = "block";
        tasksArr.map((task, index) => {
            let status = "";
            let check = '';
            if (task.status == 1) {
                status = 'class="done"';
                check = 'checked';
            }
            newTask += ` <li data-itemIndex = "${index + 1}">
                    <label ${status}> <input type="checkbox" ${check}
                    class="option-input radio"> <span class="label-text">${task.item}</span></label>
                    <button  class="delete btn btn-outline-danger "><i class = "fa fa-trash"></i></button>
                </li>`;

        });
        ul.innerHTML = newTask;
        let listTasks = document.querySelectorAll("ul li");
        listTasks.forEach((li) => {
            li.querySelector("input").addEventListener('click', () => {
                let index = li.dataset.itemindex;
                taskComplete(index);
            });

            li.querySelector(".delete").addEventListener('click', () => {
                let index = li.dataset.itemindex;
                deleteTask(index);

            });
        })

    }).catch(e => console.log(e));
}

async function taskComplete(i) {
    await chrome.storage.local.get("tasks")
        .then(tasks => {
            let tasksArr = JSON.parse(tasks["tasks"]);
            console.log(tasksArr[i - 1].status)
            if (tasksArr[i - 1].status === 0) {
                tasksArr[i - 1].status = 1;
                document.querySelector('li[data-itemIndex ="' + i + '"] label').className = 'done';


            } else {
                tasksArr[i - 1].status = 0;
                document.querySelector('li[data-itemIndex ="' + i + '"] label').classList.remove("done");
            }

            registerTasks(tasksArr);

        })
        .catch(e => console.log(e))

}

async function deleteTask(i) {
    await chrome.storage.local.get("tasks")
        .then(tasks => {
            let tasksArr = JSON.parse(tasks["tasks"]);
            tasksArr.splice(i - 1, 1);
            registerTasks(tasksArr);
            document.querySelector('li[data-itemIndex ="' + i + '"]').remove();

        }).catch(e => console.log(e));
    getTasks();
}

async function registerTasks(tasks) {
    const tasksStr = JSON.stringify(tasks);
    await chrome.storage.local.set({ "tasks": tasksStr });
}

getTasks();
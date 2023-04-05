

var nodes = []
console.log(nodes)
var NODI = 4;
var MIN_HEART_RATE = 2_000;
var MAX_HEART_RATE = 10_000;
var T_FAIL = log2(NODI)*(MAX_HEART_RATE);

class Node {

    container = document.getElementById("container");
    
    

    constructor(x, y, isFailed = false, color = "blue") {
        if (isFailed) {
            color = "red";
        }
        this.id = crypto.randomUUID();
        /* 
         * this.heart_rate range => 2_000ms to 10_000ms
         * (random_gen * (max - min)) + min
         */
        this.heart_rate = (parseInt(Math.random() * (MAX_HEART_RATE-MIN_HEART_RATE))) + 2_000;
        this.freq_rate = parseFloat(((1/this.heart_rate)*100).toFixed(3));
        this.x = parseInt(x);
        this.y = parseInt(y);
        this.color = color;
        this.isFailed = isFailed;
        this.range = 500; // portata dell'invio del messaggio
        this.children = [];
        this.probVal = parseFloat((1/(Math.random()*(20-10)+10)).toFixed(2));
        this.probMatrix = [[(1 - this.probVal).toFixed(2), this.probVal.toFixed(2)], [0, 1]];
        this.comunication_data = {}
        this.other_nodes_data = {}
        this.other_nodes_data[this.id] = [this.isFailed, getDate()] // backup object for dead nodes
        // this.comunication_data[this.id] = `info su ${this.id}`
        this.listeners = {};
        this.create();
        this.updateNodesList()
        // this.failTimer();
        this.send_data();
        this.initNode();
        this.T_Fail_check()
    }
    

    addEventListener(eventName, callback) {
        if (!this.listeners[eventName]) {
          this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);
      }
    
      removeEventListener(eventName, callback) {
        if (this.listeners[eventName]) {
          this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
        }
      }
    
      emit(eventName, data_nodes, comunication_data={}) {
        Object.values(nodes).forEach(node => {
          if (node.listeners[eventName]) {
            node.listeners[eventName].forEach(callback => callback(data_nodes,comunication_data));
          }
        });
      }

    set changeColor(color){
        this.color = color
    }

    set changeStatus(status) {
        this.isFailed = status;
        var this_nodo = document.querySelector(`div[data-id='${this.id}']`)
        if(this.isFailed){
            this.changeColor = "red"
            this_nodo.style.backgroundColor = "red";
        }
        else{
            this.changeColor = "blue"
            this_nodo.style.backgroundColor = "blue";
        }
    }

    T_Fail_check(){

        var interval_id = setInterval(() => { 
            return new Promise(resolve => {
                
                resolve(() => {   
                    
                    if (!(this.isFailed)) {
                        this.T_Fail_action();
                    }
                        
                    else {
                        clearInterval(interval_id);
                    }
                });
            }).then(callback => callback());
        }, T_FAIL);

        /*
        var interval_id = setInterval(async () => { 
            const callback = await new Promise(resolve => {

                resolve(() => {

                    if (!(this.isFailed)) {
                        this.T_Fail_action();
                    }
                        
                    else {
                        clearInterval(interval_id);
                    }
                });
            });
            return callback();
        }, T_FAIL);
        */
    }


    T_Fail_action() {
        console.log("TFAIL_ACTION");
        if (this.other_nodes_data) {
            for (let objKey in this.other_nodes_data) {
                let obj = this.other_nodes_data[objKey];
                // console.log(obj[1])
                // console.log(getDate())
                // console.log(getDate() - obj[1])
                // console.log(!((getDate() - obj[1]) <= T_FAIL))
                if (!((getDate() - obj[1]) <= T_FAIL)) {
                    // console.log(obj);
                    // console.log(obj[1]);
                    console.log(`id: ${this.id}; id_eliminato: ${objKey}`)
                    delete this.other_nodes_data[objKey];
                }
            }
        }
    }

    // T_Fail_action(){
    //     console.log("TFAIL_ACTION")
    //     if(this.other_nodes_data){
    //         for (let info in this.other_nodes_data) {
    //             for (let key in info){
    //                 console.log(info[key][1])
    //                 console.log(getDate())
    //                 console.log(getDate() - info[key][1])
    //                 if(!((getDate() - info[key][1]) >= T_FAIL)){
    //                     console.log(`${info}: ${info[key]}`)
    //                     delete info[key];
    //                 }
    //             }
    //         }
    //     }
    // }

    initNode(){

        this.addEventListener(this.id, (data, comunication_data) => {
            // console.log(`Nodo: ${this.id}; data: ${data}`);
            for (let key in data) {
                if (key in this.other_nodes_data) {
                  if (data[key][1] < this.other_nodes_data[key][1]) {
                    this.other_nodes_data[key][0] = data[key][0]; // status
                  }
                } else {
                  this.other_nodes_data[key] = data[key];
                }
              }
            // console.log(comunication_data)
            for (let key in comunication_data) {
                if (!this.comunication_data.hasOwnProperty(key)) {
                    this.comunication_data[key] = comunication_data[key];
                }
            }
          });
        // this.comunication_data = {id: this.id, date: getDate()}
    }

    create() {
        var el = document.createElement("div");
        el.classList.add("node");
        el.classList.add("running-node");
        el.style.left = `${this.x}px`;
        el.style.bottom = `${this.y}px`;
        el.setAttribute("data-id", this.id)
        container.appendChild(el)
        // var circle = document.createElement("div");
        // // circle.classList.add("circle_range");
        // circle.style.width = `${this.range}px`;      
        // circle.style.height = `${this.range}px`;      
        // circle.style.left = `${this.x}px`;      
        // circle.style.bottom = `${this.y}px`;   
        // el.setAttribute("data-node-id", this.id)
        // container.appendChild(circle)
    }

    vis_send_data(){
        var this_nodo = document.querySelector(`div[data-id='${this.id}']`)
        this_nodo.style.backgroundColor = "#0f0";
        // var circle = document.createElement("div");
        // circle.classList.add("circle");      
        // circle.style.left = `${this.x}px`;      
        // circle.style.bottom = `${this.y}px`;      
        // container.appendChild(circle)
        // console.log(`X: ${this.x}; Y: ${this.y}; cerchio_left: ${circle.style.left}; cerchio_bottom: ${circle.style.bottom}; cerchio_top: ${circle.style.top}; cerchio_right: ${circle.style.right};`)
        
        // setTimeout(() => {
        //     document.getElementsByClassName("circle")[0].remove();
        // }, 2*1000)
      
        setTimeout(() => {
            this_nodo.style.backgroundColor = this.color;
        }, 500);
    }

    updateNodesList(){
        nodes.push(this);
    }


    toString() {
        return `X: ${this.x}; Y: ${this.y};`;
    }

    displayInfo(){
        
    }
    prepareData(){
        var dest_nodes = [] // nodi destinatari
        do{
            var index1 = Math.floor((Math.random() * 1000)%nodes.length);
        } while (nodes[index1] === this);

        dest_nodes.push(nodes[index1]);

        var index2;
        var elemento2;

        do {
            index2 = Math.floor(Math.random() * nodes.length);
            elemento2 = nodes[index2];
        } while (index2 === index1 && nodes[index2] === this);

        dest_nodes.push(elemento2);
        return dest_nodes;
    }
    
    async send_data(comunication_data={}){

            if (Object.keys(this.comunication_data).length != 0){
                comunication_data=this.comunication_data

            }

            var interval_id = setInterval(() => { 
                return new Promise(resolve => {
                    
                    resolve(() => {   
                        
                        if(!(this.isFailed)){
                            if (eseguiConProb(this.probVal)){
                                this.vis_send_data();
                                /* send data */
                                this.prepareData().forEach((node_dest) => {
                                    this.other_nodes_data[this.id][1] = getDate();
                                    
                                    this.emit(node_dest.id, this.other_nodes_data, comunication_data);
                                })                        
                            }
                            else{
                                this.changeStatus = true;
                                console.log(`${this.id} fallito`)
                                clearInterval(interval_id);
                            }
                        }
                    });
                }).then(callback => callback());
            }, this.heart_rate); 

            /*
                var interval_id = setInterval(async () => { 
                const callback = await new Promise(resolve => {

                    resolve(() => {

                        if (!(this.isFailed)) {
                            if (eseguiConProb(this.probVal)) {
                                this.vis_send_data();
                                this.prepareData().forEach((node_dest) => {
                                    this.other_nodes_data[this.id][1] = getDate();

                                    this.emit(node_dest.id, this.other_nodes_data, comunication_data);
                                });
                            }
                            else {
                                this.changeStatus = true;
                                console.log(`${this.id} fallito`);
                                clearInterval(interval_id);
                            }
                        }
                    });
                });
                return callback();
            }, this.heart_rate);
            */

    }
    /*
    async send_data() {
        if (!this.isFailed) {
            while (true) {
                await new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, this.heart_rate);
                });
                await this.vis_send_data();
            }
        }
    }
    */

    async failTimer() {
        // randomTime range => 5_000ms to 30_000ms
        const randomTime = (Math.random() * (30_000-5000)) + 5000;
        console.log(randomTime)

        return new Promise(resolve => {

            setTimeout(() => { 
                resolve(() => {
                    this.changeStatus = true;
                    console.log(`${this.id} fallito`)
                });
                
                // this.remove() 
            }, randomTime); 
        }).then(callback => callback()); // chiamata alla funzione restituita dalla promise;        
    }
}

function log2(val) {
    return Math.ceil(Math.log(val) / Math.log(2));
}

width_range = getComputedStyle(document.documentElement).getPropertyValue('--container-w')
height_range = getComputedStyle(document.documentElement).getPropertyValue('--container-h')

for(i=0; i<NODI; i++){
    new Node((Math.random()*1190)+10, (Math.random()*890)+10)
}

// console.log(nodes)
max_heartRate = nodes.map(node => node.heart_rate).reduce((a, b) => Math.max(a,b))
// console.log(max_heartRate)

ordered_nodes = nodes.sort((a, b) => a.heart_rate - b.heart_rate);
console.log(ordered_nodes)

/*
ordered_nodes.forEach((node) => {
    console.log(`VAL: ${node.probVal}; Prob Matrix: ${node.probMatrix}`)
})
*/
filteredArray = ordered_nodes.map(({probVal, probMatrix}) => ({probVal, probMatrix: probMatrix.join(' - ')}))
console.table(filteredArray)

function eseguiConProb(failPRob) {
    return !(Math.random() <= failPRob);
    /*
    if (Math.random() < failPRob) {
        // Esegui la funzione
        console.log("La funzione è stata eseguita con successo.");
    } else {
        // Non eseguire la funzione
        console.log("La funzione non è stata eseguita.");
    }
    */
}

function getDate(){
    let date = new Date();
    let day = String(date.getDay()).padStart(2, '0')
    let month = String(date.getMonth()).padStart(2, '0')
    let hours = String(date.getHours()).padStart(2, '0')
    let minutes = String(date.getMinutes()).padStart(2, '0')
    let seconds = String(date.getSeconds()).padStart(2, '0')
    return date
}


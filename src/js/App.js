App = {
    web3Provider: null,
    contract: null,

    init: function() {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
      } else {
        // If no injected web3 instance is detected, fall back to Ganache
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);

      App.initContract();
    },

    initContract: function() {
        // ABI of contract deployed in Ropsten test net
        var ToDoContract = web3.eth.contract([
          {
            "constant": false,
            "inputs": [
              {
                "name": "_boss",
                "type": "address"
              }
            ],
            "name": "addBoss",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "constant": false,
            "inputs": [
              {
                "name": "_name",
                "type": "string"
              },
              {
                "name": "_content",
                "type": "string"
              },
              {
                "name": "_bounty",
                "type": "uint256"
              }
            ],
            "name": "addTask",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "constant": false,
            "inputs": [
              {
                "name": "_taskId",
                "type": "uint256"
              }
            ],
            "name": "checkDone",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "constant": true,
            "inputs": [
              {
                "name": "",
                "type": "address"
              }
            ],
            "name": "addedTask",
            "outputs": [
              {
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [
              {
                "name": "",
                "type": "uint256"
              }
            ],
            "name": "boss",
            "outputs": [
              {
                "name": "",
                "type": "address"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "getIdTaskAdded",
            "outputs": [
              {
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "getNameTaskAdded",
            "outputs": [
              {
                "name": "",
                "type": "string"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "numberOfTask",
            "outputs": [
              {
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [
              {
                "name": "",
                "type": "address"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "projectDeadline",
            "outputs": [
              {
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [
              {
                "name": "",
                "type": "address"
              }
            ],
            "name": "taskAdded",
            "outputs": [
              {
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [
              {
                "name": "",
                "type": "uint256"
              }
            ],
            "name": "taskList",
            "outputs": [
              {
                "name": "boss",
                "type": "address"
              },
              {
                "name": "name",
                "type": "string"
              },
              {
                "name": "content",
                "type": "string"
              },
              {
                "name": "bounty",
                "type": "uint256"
              },
              {
                "name": "done",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "timeRemain",
            "outputs": [
              {
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          }
        ])

        // address of deployed Contract in Ropsten test net
        App.contract = ToDoContract.at("0x440278a4a13f889f91478e509382877a4746a1f3")

    $(document).on('click', '.submit', App.createNewTask);
    $(document).on('click', '.check-done', App.checkDoneTask);
    $(document).on('click', '.add-boss', App.addBoss);
    // gọi hàm updateState() mỗi 1s
    setInterval(App.updateState, 1000);
  },

  updateState: function() {
    let contract = App.contract;

    contract.owner(function(err, result){
      if(!err) {
          $("#dev-address").text(result);
      } else
      console.error(err);
    });

    contract.timeRemain(function(err, result){
      if(!err) {
        $("#project-deadline").text(result);
      } else {
        console.log(err);
      }
    });

    contract.getIdTaskAdded(function(err, result) {
      if(!err) {
        $("#task-id").text(result);
      } else {
        console.log(err);
      }
    });

    contract.getNameTaskAdded(function(err, result) {
      if(!err) {
        $("#taskName").text(result);
      } else {
        console.log(err);
      }
    });
  },

  createNewTask: function() {
    let contract = App.contract;
    let coinbase = web3.eth.coinbase;
    var name = document.getElementById("task-name").value;
    var content = document.getElementById("task-content").value;
    var bounty = parseInt(document.getElementById("task-bounty").value);

    contract.addTask(name, content, bounty, { value: web3.toWei(bounty, 'ether') }, function (err, result) {
      if (!err) console.log(result);
      else console.error(err);
    });
  },

  checkDoneTask: function() {
    let contract = App.contract;

    contract.getIdTaskAdded(function(err,result){
      if(!err) {
        taskNumber = result;

        contract.checkDone(taskNumber, function(err, result) {
          if(!err) {
            console.log(result);
          } else {
            console.log(err);
          }
        })

      } else {
        console.log(err);
      }
    });
  },

  addBoss: function() {
    let contract = App.contract;

    var bossAddress = document.getElementById("boss-address").value;
    contract.addBoss(bossAddress, function(err, result) {
      if(!err) {
        console.log("Success!");
      } else {
        console.log(err);
      }
    })
  }
}

  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
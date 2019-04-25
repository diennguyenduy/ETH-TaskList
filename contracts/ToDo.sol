pragma solidity ^0.4.23;

contract ToDo {
    address public owner;
    address [] public boss;
    uint public projectDeadline = block.timestamp + 10 * 1 days;
    
    mapping (address => uint) public taskAdded;
    mapping (address => bool) public addedTask;
    
    function timeRemain() public view returns (uint) {
        return (projectDeadline - now) / 3600;
    }

    constructor() public {
        owner = msg.sender;
    }

    function addBoss(address _boss) public {
        require(msg.sender == owner);
        require(_boss != msg.sender);
        require(!containArray(_boss));
        boss.push(_boss);
    }

    function containArray(address element)
        internal
        returns (bool)
    {
        bool found = false;
        for(uint8 i = 0; i < boss.length; i++) {
            if(boss[i] == element) {
                found = true;
                break;
            }
        }
        return found;
    }
    
    struct Task{
        address boss;
        string name;
        string content;
        uint bounty;
        bool done;
    //    uint taskDeadline; // bổ sung sau 
    }
    
    mapping(uint => Task) public taskList;
    uint public numberOfTask = 0;
    
    function addTask(string _name, string _content, uint _bounty) public payable {
        require(containArray(msg.sender), "Must be a boss");
        require(now < projectDeadline, "Must in time of project");
        require(_bounty >= 1, "bounty have to more than 1 ether");
        require(msg.value >= 1 * 1 ether);
        require(msg.sender.balance >= msg.value);
        require(addedTask[msg.sender] == false, "You created a task or can not create a task");
        
        if(msg.value > _bounty * 1 ether) {
            msg.sender.transfer(msg.value - (_bounty * 1 ether));
        }
        taskList[numberOfTask] = Task(msg.sender, _name, _content, _bounty, false);
        taskAdded[msg.sender] = numberOfTask;
        addedTask[msg.sender] = true;
        numberOfTask++;
    }
    
    function checkDone(uint _taskId) public {
        require(taskList[_taskId].boss == msg.sender);
        require(addedTask[msg.sender] == true);
        require(!taskList[_taskId].done);
        
        taskList[_taskId].done = true;
        addedTask[msg.sender] = false;
        owner.transfer(taskList[_taskId].bounty * 1 ether);
    }
    
    // function getTaskAdded() public view returns(string, string, uint) {
    //     require(containArray(msg.sender));
    //     require(addedTask[msg.sender] == true);
    //     return (taskList[taskAdded[msg.sender]].name, taskList[taskAdded[msg.sender]].content, taskList[taskAdded[msg.sender]].bounty);
    // }
    
    function getIdTaskAdded() public view returns (uint) {
        require(containArray(msg.sender));
        require(addedTask[msg.sender] == true);
        
        if(!taskList[taskAdded[msg.sender]].done) {
            return taskAdded[msg.sender];
        }
    }
    
    function getNameTaskAdded() public view returns (string) {
        require(containArray(msg.sender));
        
        if(addedTask[msg.sender] == true && !taskList[taskAdded[msg.sender]].done) {
            return taskList[taskAdded[msg.sender]].name;
        } else {
            return("You have not create a task yet!");
        }
    }
}

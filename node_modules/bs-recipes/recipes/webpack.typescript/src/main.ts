type Person = {
    name:string
}

const sayHi = ({name}:Person)=> {
    document.querySelector('#example').textContent = `
        Hi, ${name}
    `
};

sayHi({name: "Frank"});

// Uncomment the following line to see the type-checking in action
// sayHi({name: 0});

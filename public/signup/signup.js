var addForm = document.getElementById('addform')

addForm.addEventListener('submit', addUser)

function addUser(e) {
    e.preventDefault()
    var userName = document.getElementById('name').value;
    var userEmail = document.getElementById('email').value;
    var userPassword = document.getElementById('password').value;
    var userNumber = document.getElementById('phoneNumber').value;

    var userDetails = {
        username: userName,
        useremail: userEmail,
        userpassword: userPassword,
        usernumber: userNumber
    }
    
    console.log('consoling user data before posting', userDetails)
    axios.post('http://localhost:3000/user/add-user', userDetails)
    .then((response) => {
        console.log(response)
        alert('You have Signed Up Successfully! Now you can Log In')
    })
    .catch(err => {
        if(err == "AxiosError: Request failed with status code 400"){
            alert('User already exists!')
        } else{
            console.log(err)
        }
    })
}
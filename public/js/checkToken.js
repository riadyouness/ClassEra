function checkToken() {
    fetch("/auth/", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(({ status, body }) => {
            if (body.valid) {
                console.log('fetchData')
                fetchData()
            } else {
                window.location.href = "/login";
            }
        })
        .catch(err => {
            console.log(err)
        });
}

function logout() {
    localStorage.setItem("token", '')
 
    window.location.href = "/login";
}

checkToken() 

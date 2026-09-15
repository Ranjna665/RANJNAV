//wait  until  for the webbrowser has completely loaded the HTMLstructure
document.addEventListener("DOMContentLoaded", async()  => { 
    //locate the login from on the page
    const loginForm = document.getElementById("login-form");
    // listen for the user clicking the "submit" or "send message" button
        if (loginForm) {
            loginForm.addEventListener("submit",  async (event) => {
                // stop the default html behaviour (which refreshes the entire  webpage)
                event.preventDefault();
            //grab the value the user typed into the input fields
                const usernameInput = document.getElementById("login-username").value;
                const passwordInput = document.getElementById("login-password").value;
                try{
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type':'application/json'
                        },
                        body: JSON.stringify({
                          username:  usernameInput,
                          password: passwordInput
                        })
                    });
                const data  = await response.json();//parse Json instead of raw text
                if(response.ok){
                    localStorage.setItem('token', data.token);
                alert(data.message); //" login successful!"
                //optional: redirect the user to a home or landing page
                window.location.href = "/dashboard.html";
             }else{
                // show error like"invalid username or password"
                alert("login failed:" + data.message);
                }
            }catch (error) {
                console.error("Login networking error:", error);
                alert("Could not connect to the server. Please try agian later.");
            }
         });
        }
        //locate the signup form on the page 
        const signupForm = document.getElementById("signup-form");

        if(signupForm){
            signupForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const usernameInput = document.getElementById("signup-username").value;
                const passwordInput = document.getElementById("signup-password").value;

                try{
                    const response = await fetch('/register',{
                        method: 'POST',
                        headers:{
                            'Content-Type': 'application/json'
                         },
                         body: JSON.stringify({
                            username: usernameInput,
                            password: passwordInput
                         })
                    });
                    const message = await response.text();
                    if(response.ok) {
                        alert(message);//"Account created successfully!"
                        window.location.href ="/login.html";
                     } else {
                       alert("Signup failed: " + message);
                           }
                }catch (error){
                    console.error("Signup networking error:", error);
                    alert("Could not connect to the server. Please try again later.");

                }

                });
            }
            const secureContent = document.getElementById("secure-content");
            if (secureContent) {
                // retrieve our singed digital token
                const token =localStorage.getItem("token");
                //kick the user our immedaitely if they try to access dashboard without a token
                if (!token){
                    alert("Access Denied! Please login first.");
                    window.location.href ="/login.html";
                    return;
                }
                     try{
                      //   Request the protected data from node server route
                      const response = await fetch('/api/dashboard-data',{
                        method:'GET',
                        headers:{
                            'Authorization':`Bearer ${token}`
                        }
                      });
                      if(response.ok){
                        const data = await response.json();
                        secureContent.innerText = data.secretMessage;
                      }else{
                        localStorage.removeItem("token");
                        window.location.href ="/login.html";
                      }
                      }catch (err) {
                        console.error("Dashboard validation crash:", err);
                     }
            }
            //LOGOUT BUTTON MECHANIC
            const logoutBtn = document.getElementById("logout-btn");
            if(logoutBtn){
                logoutBtn.addEventListener("click", () => {
                    localStorage.removeItem("token"); //erase token memory
                    alert("Logged out successfully.");
                    window.location.href = "/login.html";
                });
            }
        });

    
    
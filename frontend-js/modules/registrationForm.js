import axios from "axios"

export default class RegistrationForm {
    constructor() {
        this._csrf = document.querySelector('[name="_csrf"]').value
        this.form = document.querySelector('#registration-form')
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.insertValitationElements()
        this.username = document.querySelector('#username-register')
        this.username.previousValue = ''
        this.email = document.querySelector("#email-register")
        this.email.previousValue = ''
        this.password = document.querySelector("#password-register")
        this.password.previousValue = ''
        this.username.isUnique = false
        this.email.isUnique = false
        this.events()
    }

    // Events
    events() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault()
            this.fromSubmitHanlder()
        })

        this.username.addEventListener("keyup", () => {
            this.isDifferent(this.username, this.usernameHandler)
        })
        this.email.addEventListener("keyup", () => {
            this.isDifferent(this.email, this.emailHandler)
        })
        this.password.addEventListener("keyup", () => {
            this.isDifferent(this.password, this.passwordHandler)
        })

        this.username.addEventListener("blur", () => {
            this.isDifferent(this.username, this.usernameHandler)
        })
        this.email.addEventListener("blur", () => {
            this.isDifferent(this.email, this.emailHandler)
        })
        this.password.addEventListener("blur", () => {
            this.isDifferent(this.password, this.passwordHandler)
        })
    }


    // Methods
    fromSubmitHanlder() {
        this.usernameImmediately()
        this.usernameAfterDelay()
        this.emailAfterDelay()
        this.passwordImmediately()
        this.passwordAfterDelay()

        if (
            this.username.isUnique && 
            !this.username.errors && 
            this.email.isUnique &&
            !this.email.errors &&
            this.password.errors
        ) {
            this.form.submit()
        }
    }



    insertValitationElements() {
        this.allFields.forEach((el) => {
            el.insertAdjacentHTML('afterend', '<div class="alert alert-danger small liveValidateMessage"></div>')
        })
    }

    isDifferent(el, handler) {
        if(el.previousValue != el.value) {
            handler.call(this)
        }
        el.previousValue = el.value
    }

    usernameHandler() {
        this.username.errors = false
        this.usernameImmediately()
        clearTimeout(this.username.timer)
        this.username.timer = setTimeout(() => this.usernameAfterDelay(), 750)
    }

    emailHandler() {
        this.email.errors = false
        clearTimeout(this.email.timer)
        this.email.timer = setTimeout(() => this.emailAfterDelay(), 750)
    }

    passwordHandler() {
        this.password.errors = false
        this.passwordImmediately()
        clearTimeout(this.password.timer)
        this.password.timer = setTimeout(() => this.passwordAfterDelay(), 750)
    }

    emailAfterDelay() {
        if(!/^\S+@\S+$/.test(this.email.value)) {
            this.showValidationError(this.email, "You must provide an valid email address.")
        }

        if(!this.email.errors) {
            axios.post('/doesEmailExist', {_csrf:this._csrf, email: this.email.value})
            .then((response) => {
                if(response.data) {
                    this.email.isUnique = false
                    this.showValidationError(this.email, "This email already exist.")
                } else {
                    this.email.isUnique = true
                    this.hideValidationError(this.email)
                }
            }).catch(() => {
                console.log("Try again later")
            })
        }
    }

    usernameImmediately() {
        if(this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)) {
           this.showValidationError(this.username, "Username Can Only contain letters and numbers")
        }

        if(this.username.value.length > 30) {
            this.showValidationError(this.username, "Username must be less than 30 characters")
        }

        if(!this.username.errors) {
            this.hideValidationError(this.username) 
        }

    }

    passwordImmediately() {
        if(this.password.value.length > 30) {
            this.showValidationError(this.password, "Password cannot exceed more than 30 characters.")
        }

        if(!this.password.errors) {
            this.hideValidationError(this.password)
        }
    }

    passwordAfterDelay() {
        if(this.password.value.length < 10) {
            this.showValidationError(this.password, "Password must be atleast 10 characters")
        }
    }

    hideValidationError(el) {
        el.nextElementSibling.classList.remove("liveValidateMessage--visible")
    }

    showValidationError(el, message) {
        el.nextElementSibling.innerHTML = message
        el.nextElementSibling.classList.add("liveValidateMessage--visible")
        el.errors = true
    }

    usernameAfterDelay() {
        if(this.username.value.length < 3) {
            this.showValidationError(this.username, "Username must be atleast 3 characters")
        }

        if(!this.username.errors) {
            axios.post('/doesUsernameExist', {_csrf:this._csrf, username: this.username.value})
            .then((response) => {
                if(response.data) {
                    this.showValidationError(this.username, "This username is already exist.")
                    this.username.isUnique = false
                } else {
                    this.username.isUnique = true
                }
            }).catch((err) => {
                console.log("Please try again later")
            })
        }
    }
}
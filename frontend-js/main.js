import Search from "./modules/search"
import Chat from "./modules/chat"
import RegistrationForm from "./modules/registrationForm"
import SPA from "./modules/spa"

if(document.querySelector(".header-search-icon")) {
    new Search()
}
if(document.querySelector("#chat-wrapper")) {
    new Chat()
    SPA()
}

if(document.querySelector("#registration-form")) {new RegistrationForm()}
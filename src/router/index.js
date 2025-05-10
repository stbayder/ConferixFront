import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue"
import SignUpPage from "../views/SignUpPage.vue"
import LoginView from "../views/LoginView.vue";


const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
  {
    path: "/sign-up",
    name: "sign-up",
    component: SignUpPage,
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue"
import SignUpPage from "../views/SignUpPage.vue"
import LoginView from "../views/LoginView.vue";
import CreateProjectForm from "@/views/CreateProjectForm.vue";
import MyProjects from "@/views/MyProjects.vue";
import ForumComp from "@/views/ForumComp.vue"
import AssigmentComments from "@/views/AssignmentComments.vue"

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
  },
  {
    path: "/projects/create",
    name: "create-project",
    component: CreateProjectForm,
  },
  {
    path: "/projects/dashboard",
    name: "projects-dashboard",
    component: MyProjects,
  },
  {
    path: "/projects/forum",
    name: "forum",
    component: ForumComp,
  },
  {
  path: '/projects/forum/assigment/:id',
  name: 'AssigmentComments',
  component: AssigmentComments // or wherever your component is
}

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

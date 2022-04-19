import "@/router";
import VueRouter from "vue-router";

const routes = [
  {
    path: "/assignHomework",
    name: `assignHomework`,
    component: () => import( /* webpackChunkName: "assignHomework" */ "../views/assignHomework.vue")
  },
  {
    path: "/class",
    name: `class`,
    component: () => import( /* webpackChunkName: "assignHomework" */ "../views/Class.vue")
  },
  {
    path:'/choseDate/:type/:userId',
    name: 'ChoseDate',
    component: () => import('../views/dates/index.vue')
  },
  {
    //path: '/choseDate/:type/:userId',
    path:'/workGroup/:classId/:index',
    name: 'workGroup',
    component: () => import('../views/workGroup.vue')
  },
  {
    path:'/homeWorkList',
    name: 'homeWorkList',
    props:true,
    component: () => import('../views/homeWorkList.vue')
  },
  {
    path:'/publishInfo',
    name: 'publishInfo',
    component: () => import('../views/publishInfo.vue')
  },
  {
    path:'/serach',
    name: 'serach',
    props:true,
    component: () => import('../views/serach.vue')
  },
  {
    path:'/reviewHomework',
    name: 'reviewHomework',
    props:true,
    component: () => import('../views/reviewHomework.vue')
  },
  {
    path:'/discussion',
    name: 'discussion',
    props:true,
    component: () => import('../views/discussion.vue')
  },
  {
    path:'/dohomework',
    name: 'dohomework',
    props:true,
    component: () => import('../views/doHomeWork.vue')
  },
  {
    path:'/peerhomework',
    name: 'peerhomework',
    props:true,
    component: () => import('../views/peerHomework.vue')
  },
  {
    path:'/releaseDission',
    name: 'releaseDission',
    props:true,
    component: () => import('../views/releaseDission.vue')
  },
  {
    path: "/resourcesPreview",
    name: `ResourcesPreview`,
    component: () =>
      import(/* webpackChunkName: "discussion" */ "../views/resourcesPreview.vue")
  },
  {
    path: "/studentHomework",
    name: `studentHomework`,
    component: () =>
      import(/* webpackChunkName: "discussion" */ "../views/studentHomework.vue")
  },
  {
    path: "/classGroup",
    name: `classGroup`,
    component: () =>
      import(/* webpackChunkName: "discussion" */ "../views/classGroup.vue")
  },
  {
    path: "/addGroup",
    name: `addGroup`,
    component: () =>
      import(/* webpackChunkName: "discussion" */ "../views/addGroup.vue")
  },
  {
    path: "/addGroupStudent",
    name: `addGroupStudent`,
    component: () =>
      import(/* webpackChunkName: "discussion" */ "../views/addGroupStudent.vue")
  },
  {
    path: "/editClassGroup",
    name: `editClassGroup`,
    component: () =>
      import(/* webpackChunkName: "discussion" */ "../views/editClassGroup.vue")
  },
  {
    path: "*",
    redirect: "/assignHomework",
    hidden: true,
  },
];

const route = new VueRouter({
  routes,
});

export default route;

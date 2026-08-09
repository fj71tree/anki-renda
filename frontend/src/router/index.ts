import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import SignInPage from '@/pages/SignInPage.vue'
import DeckListPage from '@/pages/DeckListPage.vue'
import StudyPage from '@/pages/StudyPage.vue'
import DeckDetailPage from '@/pages/DeckDetailPage.vue'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.vue'
import ResetPasswordPage from '@/pages/ResetPasswordPage.vue'
import SignUpPage from '@/pages/SignUpPage.vue'
import SignUpCompletePage from '@/pages/SignUpCompletePage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import VerifyEmailPage from '@/pages/VerifyEmailPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage, meta: { guestOnly: true } },
    { path: '/signup', name: 'signup', component: SignUpPage, meta: { guestOnly: true } },
    {
      path: '/signup/complete',
      name: 'signup-complete',
      component: SignUpCompletePage,
      meta: { guestOnly: true },
    },
    {
      path: '/verify-email/:key',
      name: 'verify-email',
      component: VerifyEmailPage,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordPage,
      meta: { guestOnly: true },
    },
    {
      path: '/reset-password/:uid/:token',
      name: 'reset-password',
      component: ResetPasswordPage,
      meta: { guestOnly: true },
    },
    { path: '/signin', name: 'signin', component: SignInPage, meta: { guestOnly: true } },
    { path: '/decks', name: 'decks', component: DeckListPage, meta: { requiresAuth: true } },
    {
      path: '/decks/:deckId',
      name: 'deck-detail',
      component: DeckDetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/study/:deckId',
      name: 'study',
      component: StudyPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsPage,
      meta: { requiresAuth: true },
    },
  ],
})

function isLoggedIn() {
  const token = localStorage.getItem('accessToken')
  return !!token
}

router.beforeEach((to) => {
  const loggedIn = isLoggedIn()

  if (to.meta.requiresAuth && !loggedIn) {
    return { name: 'signin', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && loggedIn) {
    return { name: 'decks' }
  }
})

export default router

<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="username" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return { username: '', password: '' };
  },
  methods: {
    ...mapActions(['login']),
    async login() {
      await this.login({ username: this.username, password: this.password });
      this.$router.push('/admin');
    },
  },
};
</script>

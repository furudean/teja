<script lang="ts">
	/** @type {import('./$types').ActionData} */
	export let form
</script>

<h1>Login</h1>

<form action="?/login" method="POST">
	<div>
		<label for="passphrase">passphrase</label>
		<input name="passphrase" type="text" required />
	</div>

	{#if form?.invalid}
		<p class="error">Username and password is required.</p>
	{/if}

	{#if form?.credentials}
		<p class="error">You have entered the wrong credentials.</p>
	{/if}

	<button type="submit">Log in</button>
</form>

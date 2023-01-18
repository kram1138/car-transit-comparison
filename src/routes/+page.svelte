<script lang="ts">
    import type { ActionData, PageData } from "./$types";
    export let data: PageData;
    export let form: ActionData;
</script>

<form method="POST">
    <label>
        Api Key
        <input name="apiKey" value={form?.data?.apiKey ?? ""} />
    </label>
    <label>
        Time (UTC)
        <input
            name="time"
            type="datetime-local"
            value={form?.data?.time.toString()}
        />
    </label>
    <label>
        Locations (each line is a location)
        <textarea
            name="locations"
            value={form?.data?.locations.toString() ?? ""}
        />
    </label>
    <button>Send</button>
</form>
{#if form?.success && form.ratios}
<p>The ratio of car distance / transit distance: {form.ratios.transitDistance}</p>
<p>The ratio of car travel time / transit travel time: {form.ratios.transitTime}</p>
<p>The ratio of car distance / bicycle distance: {form.ratios.bicycleDistance}</p>
<p>The ratio of car travel time / bicycle travel time: {form.ratios.bicycleTime}</p>
{/if}
{#if form?.success && form.table}
    <table>
        <thead>
            <tr>
                {#each form.table.headers as header}
                    <th>{header}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each form.table.rows as row}
                <tr>
                    {#each row as cell}<td>{cell}</td>{/each}
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
{#if form && !form.success}
    Errors:
    <pre>
{form.message}
    </pre>
{/if}

<style>
    form {
        display: flex;
        flex-direction: column;
        width: 45rem;
        align-items: stretch;
        margin-bottom: 5rem;
    }

    label {
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    textarea {
        height: 20rem;
        width: unset;
    }

    input {
        width: unset;
    }
</style>

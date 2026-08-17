<script setup>
import { onMounted, ref } from 'vue'
import * as categoriesApi from '../../api/categories'
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
const categories = ref([])
const loading = ref(true)
const newName = ref('')
const creating = ref(false)
const editingId = ref(null)
const editingName = ref('')
const busyId = ref(null)

async function load() {
  loading.value = true
  try {
    categories.value = await categoriesApi.listCategories()
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    loading.value = false
  }
}

async function create() {
  const name = newName.value.trim()
  if (!name) return
  creating.value = true
  try {
    await categoriesApi.createCategory(name)
    newName.value = ''
    await load()
    ui.pushToast('Category created.', 'success')
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    creating.value = false
  }
}

function startEdit(category) {
  editingId.value = category.id
  editingName.value = category.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function saveEdit(category) {
  const name = editingName.value.trim()
  if (!name) return
  busyId.value = category.id
  try {
    await categoriesApi.updateCategory(category.id, name)
    cancelEdit()
    await load()
    ui.pushToast('Category updated.', 'success')
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    busyId.value = null
  }
}

async function remove(category) {
  if (!confirm(`Delete category "${category.name}"?`)) return
  busyId.value = category.id
  try {
    await categoriesApi.deleteCategory(category.id)
    await load()
    ui.pushToast('Category deleted.', 'success')
  } catch (e) {
    ui.pushToast(e.message, 'error')
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <h1>Manage categories</h1>
    <p class="sub">
      New videos land uncategorized until they're assigned here — the platform's
      auto-ingest scanner never sets a category on its own.
    </p>

    <form class="create-row" @submit.prevent="create">
      <input v-model="newName" type="text" placeholder="New category name" maxlength="60" />
      <button class="btn btn-primary" type="submit" :disabled="creating || !newName.trim()">
        Add category
      </button>
    </form>

    <p v-if="loading" class="muted">Loading…</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in categories" :key="c.id">
          <td>
            <input v-if="editingId === c.id" v-model="editingName" class="edit-input" type="text" maxlength="60" />
            <span v-else>{{ c.name }}</span>
          </td>
          <td class="actions">
            <template v-if="editingId === c.id">
              <button class="btn" :disabled="busyId === c.id" @click="saveEdit(c)">Save</button>
              <button class="btn" @click="cancelEdit">Cancel</button>
            </template>
            <template v-else>
              <button class="btn" @click="startEdit(c)">Rename</button>
              <button class="btn btn-danger-outline" :disabled="busyId === c.id" @click="remove(c)">Delete</button>
            </template>
          </td>
        </tr>
        <tr v-if="!categories.length">
          <td colspan="2" class="muted">No categories yet.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.page {
  max-width: 700px;
}
.page h1 {
  font-size: 20px;
  margin: 0 0 4px;
}
.sub {
  color: var(--yt-text-secondary);
  font-size: 14px;
  margin: 0 0 20px;
}
.create-row {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.create-row input {
  flex: 1;
  border: 1px solid var(--yt-border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--yt-bg);
  color: var(--yt-text);
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th {
  text-align: left;
  color: var(--yt-text-secondary);
  font-weight: 500;
  font-size: 13px;
  padding: 8px;
  border-bottom: 1px solid var(--yt-border);
}
.table td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--yt-border);
  font-size: 14px;
}
.edit-input {
  border: 1px solid var(--yt-border);
  border-radius: 6px;
  padding: 6px 8px;
  background: var(--yt-bg);
  color: var(--yt-text);
  width: 100%;
  max-width: 220px;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.muted {
  color: var(--yt-text-secondary);
  padding: 16px 8px;
}
</style>

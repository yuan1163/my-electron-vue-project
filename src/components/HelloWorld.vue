<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button @click="generateAndPrintPDFSilently">靜默列印 PDF</button>
    <button @click="generateAndPrintPDFWithDialog">列印 PDF（顯示對話框）</button>
    <div v-if="printStatus">
      <p>列印狀態: {{ printStatus }}</p>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      printStatus: ''
    }
  },
  methods: {
    async generateAndPrintPDFSilently() {
      await this.generateAndPrintPDF(false)
    },
    async generateAndPrintPDFWithDialog() {
      await this.generateAndPrintPDF(true)
    },
    async generateAndPrintPDF(showDialog) {
      const content = '<h1>Hello, this is a test PDF</h1>'
      try {
        const result = await ipcRenderer.invoke('generate-and-print-pdf', content, showDialog)
        if (result.success) {
          this.printStatus = result.message
        } else {
          this.printStatus = `錯誤: ${result.error}`
        }
      } catch (error) {
        console.error('調用 generate-and-print-pdf 時發生錯誤', error)
        this.printStatus = '發生錯誤'
      }
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
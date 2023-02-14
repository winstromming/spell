import { createApp } from "vue"
// import Vuesax from "vuesax"
import UI from "naive-ui"
// import * as Icons from "@vicons/antd"

// import "element-plus/dist/index.css"
import index from "./index.vue"

//
const app = createApp(index)
// const ui = createVuestic()
app.use(UI)
// for (const [name, icon] of Object.entries(Icons)) {
//   app.component(name, icon)
// }
app.mount("#app")

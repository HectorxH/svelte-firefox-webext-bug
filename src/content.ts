import Accordion from "./Accordion.svelte"
import {mount} from "svelte"
const proto = Object.getPrototypeOf(document.createElement("div"))
console.log(proto)
console.log(proto.constructor)
console.log(proto.constructor.name)

const app = mount(Accordion, {target: document.body})

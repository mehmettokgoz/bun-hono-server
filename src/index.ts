import { Hono } from 'hono'
import { serve } from "@upstash/workflow/hono"
import { Client } from '@upstash/workflow'

const app = new Hono()

const BASE_URL = process.env.BASE_URL
const WORKFLOW_ENDPONT = "workflow"

const client = new Client({
  token: process.env.QSTASH_TOKEN
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post(`/${WORKFLOW_ENDPONT}`,
  serve(async (context) => {
    console.log("base_url=>",BASE_URL)
    console.log("context.url => ",context.url)
    await context.run("initial-step", () => {
      console.log("initial step ran")
    })

    await context.run("second-step", () => {
      console.log("second step ran")
    })
  })
)

app.get(`${WORKFLOW_ENDPONT}`, async (c) => {
    const body  = await c.req.raw.json()
    console.log("Body =>",body)
    console.log("Header => ",c.req.raw.headers)
})

app.post("/trigger", async (c) => {
  const { workflowRunId } = await client.trigger({
    url: `${BASE_URL}/${WORKFLOW_ENDPONT}`
  })
  return c.json({workflowRunId})
})

export default app

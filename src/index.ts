import { Hono } from 'hono'
import { serve } from "@upstash/workflow/hono"
import { Client } from '@upstash/workflow'

const app = new Hono()

function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read blob as string'));
    };
    reader.readAsText(blob);
  });
}


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
    const body  = await c.req.raw.blob()
    const text = await blobToString(body);
    console.log("Body =>",text)
    console.log("Header => ",c.req.raw.headers)
})

app.post("/trigger", async (c) => {
  const { workflowRunId } = await client.trigger({
    url: `${BASE_URL}/${WORKFLOW_ENDPONT}`
  })
  return c.json({workflowRunId})
})

export default app

import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { getSignedUrl, updateAttachmentUrl } from '../../helpers/albums'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const albumId = event.pathParameters.albumId
    if (!albumId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing albumId in the request' })
      }
    }

    const userId = getUserId(event)
    const signedUrl: string = await getSignedUrl(albumId)
    await updateAttachmentUrl(signedUrl, albumId, userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ uploadUrl: signedUrl })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)

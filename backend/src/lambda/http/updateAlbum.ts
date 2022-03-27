import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateAlbum } from '../../helpers/albums'
import { UpdateAlbumRequest } from '../../requests/UpdateAlbumRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const albumId = event.pathParameters.albumId
    const updatedAlbum: UpdateAlbumRequest = JSON.parse(event.body)

    if (!albumId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing albumId' })
      }
    }

    const userId = getUserId(event)
    await updateAlbum(albumId, userId, updatedAlbum)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({})
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)

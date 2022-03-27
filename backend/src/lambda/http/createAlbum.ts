import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateAlbumRequest } from '../../requests/CreateAlbumRequest'
import { getUserId } from '../utils';
import { createAlbum } from '../../helpers/albums'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newAlbum: CreateAlbumRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const newAlbumItem = await createAlbum(newAlbum, userId)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: newAlbumItem
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)

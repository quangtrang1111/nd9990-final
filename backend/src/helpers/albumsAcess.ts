import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { AlbumItem } from '../models/AlbumItem'
import { AlbumUpdate } from '../models/AlbumUpdate';

const logger = createLogger('helpers/albumsAcess')

export class AlbumsAccess {
  constructor(
    private readonly documentClient = new DocumentClient(),
    private readonly albumsTable = process.env.ALBUMS_TABLE,
    private readonly createdAtIndex = process.env.ALBUMS_INDEX_CREATED_AT
  ) {
  }

  async getAlbums(userId: string, albumId: string): Promise<AlbumItem[]> {
    let result;
    if (albumId) {
      result = await this.documentClient
      .query({
        TableName: this.albumsTable,
        IndexName: this.createdAtIndex,
        KeyConditionExpression: 'albumId = :albumId AND userId = :userId',
        ExpressionAttributeValues: { ':userId': userId, ':albumId': albumId }
      }).promise()
    } else {
      result = await this.documentClient
      .query({
        TableName: this.albumsTable,
        IndexName: this.createdAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }).promise()
    }

    logger.info("Got Albums with count", { count: result.Count })
    const items = result.Items as AlbumItem[]

    return items.map(i => ({ ...i, attachmentUrl: JSON.parse(i.attachmentUrl as string || '[]')}));
  }

  async createAlbum(newAlbumItem: AlbumItem): Promise<AlbumItem> {
    await this.documentClient
      .put({
        TableName: this.albumsTable,
        Item: newAlbumItem
      }).promise()

    logger.info("Created a new Album", { newAlbumItem })

    return newAlbumItem
  }

  async deleteAlbum(albumId: string, userId: string) {
    const deleteItem = await this.documentClient
      .delete({
        TableName: this.albumsTable,
        Key: { albumId, userId },
        ReturnValues: "ALL_OLD"
      }).promise()

    const deletedAlbum = deleteItem.Attributes

    logger.info("Deleted a Album", { deletedAlbum })
  }

  async updateAlbum(albumId: string, userId: string, updatedProperties: AlbumUpdate) {
    const updateItem = await this.documentClient
      .update({
        TableName: this.albumsTable,
        Key: { albumId, userId },
        ReturnValues: "ALL_NEW",
        UpdateExpression: 'set #name = :name, #dueDate = :duedate',
        ExpressionAttributeValues: {
          ':name': updatedProperties.name,
          ':duedate': updatedProperties.dueDate
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#dueDate': 'dueDate'
        }
      }).promise()

    const updatedAlbum = updateItem.Attributes

    logger.info("Updated a Album", { updatedAlbum })
  }

  async updateAttachmentUrl(attachmentUrl: string, albumId: string, userId: string) {
    const album = await this.documentClient
    .query({
      TableName: this.albumsTable,
      IndexName: this.createdAtIndex,
      KeyConditionExpression: 'albumId = :albumId AND userId = :userId',
      ExpressionAttributeValues: { ':userId': userId, ':albumId': albumId }
    }).promise()

    const albumItem = album.Items[0] as AlbumItem
    albumItem.attachmentUrl = albumItem.attachmentUrl ?JSON.parse(albumItem.attachmentUrl as string) : []
    const attachmentUrls = JSON.stringify([...albumItem.attachmentUrl, attachmentUrl]);

    const updateItem = await this.documentClient
      .update({
        TableName: this.albumsTable,
        Key: { albumId, userId },
        ReturnValues: "ALL_NEW",
        UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrls
        },
        ExpressionAttributeNames: {
          '#attachmentUrl': 'attachmentUrl'
        }
      }).promise()

    const updatedAlbum = updateItem.Attributes

    logger.info("Updated attachment url of a Album", { updatedAlbum })
  }
}

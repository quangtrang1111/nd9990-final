import * as uuid from 'uuid'
import { AlbumsAccess } from './albumsAcess'
import { AttachmentUtils } from './attachmentUtils';
import { AlbumItem } from '../models/AlbumItem'
import { CreateAlbumRequest } from '../requests/CreateAlbumRequest'
import { UpdateAlbumRequest } from '../requests/UpdateAlbumRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('helpers/album')

const albumsAccess = new AlbumsAccess()
const attachmentUtils = new AttachmentUtils()

export async function getAlbums(userId: string, albumId: string): Promise<AlbumItem[]> {
  logger.info('Get Albums with user Id', { userId })

  return await albumsAccess.getAlbums(userId, albumId)
}

export async function createAlbum(newAlbumRequest: CreateAlbumRequest, userId: string): Promise<AlbumItem> {
  const albumId = uuid.v4()
  logger.info('Create a Album with generated Id', { albumId })

  const newAlbumItem: AlbumItem = {
    ...newAlbumRequest,
    userId,
    albumId,
    createdAt: new Date().toISOString()
  }

  return await albumsAccess.createAlbum(newAlbumItem)
}

export async function deleteAlbum(albumId: string, userId: string) {
  logger.info('Delete a Album with Id', { albumId })

  return await albumsAccess.deleteAlbum(albumId, userId)
}

export async function updateAlbum(albumId: string, userId: string, updatedProperties: UpdateAlbumRequest) {
  logger.info('Update a Album with Id', { userId })

  return await albumsAccess.updateAlbum(albumId, userId, updatedProperties)
}

export async function getSignedUrl(albumId: string): Promise<string> {
  logger.info('Get signed url of a Album with Id', { albumId })

  return await attachmentUtils.getSignedUrl(albumId)
}

export async function updateAttachmentUrl(signedUrl: string, albumId: string, userId: string) {
  const attachmentUrl: string = signedUrl.split("?")[0]
  logger.info("Update the attachment url of a Album with Id", { albumId, attachmentUrl })

  return await albumsAccess.updateAttachmentUrl(attachmentUrl, albumId, userId)
}

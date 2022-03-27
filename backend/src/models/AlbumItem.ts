export interface AlbumItem {
  userId: string
  albumId: string
  createdAt: string
  name: string
  dueDate: string
  attachmentUrl?: string | string[]
}

import * as React from 'react'
import { Form, Button, Image, Divider } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getAlbums, getUploadUrl, uploadFile } from '../api/albums-api'
import { Album } from '../types/Album';

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface ViewAlbumProps {
  match: {
    params: {
      albumId: string
    }
  }
  auth: Auth
}

interface ViewAlbumState {
  file: any
  uploadState: UploadState,
  album?: Album
}

export class ViewAlbum extends React.PureComponent<
  ViewAlbumProps,
  ViewAlbumState
> {
  state: ViewAlbumState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    album: undefined
  }

  async componentDidMount() {
    await this.loadAlbumData()
  }

  loadAlbumData = async() => {
    try {
      const albums = await getAlbums(this.props.auth.getIdToken(), this.props.match.params.albumId)

      this.setState({
        album: albums[0]
      })
    } catch (e: any) {
      alert(`Failed to fetch album: ${e.message}`)
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.albumId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)
      this.loadAlbumData()

      alert('File was uploaded!')
    } catch (e: any) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>{this.state.album?.name}</h1>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Upload new photos to this album</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Photo to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>

        <Divider />
        {this.state.album?.attachmentUrl && this.state.album?.attachmentUrl.map((url, index) => (
          <div key={index}>
            <br/>
            <Image src={url} size="big" wrapped />
          </div>
        ))}
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading photo metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading photo</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}

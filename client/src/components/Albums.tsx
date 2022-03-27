import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Loader
} from 'semantic-ui-react'

import { createAlbum, deleteAlbum, getAlbums } from '../api/albums-api'
import Auth from '../auth/Auth'
import { Album } from '../types/Album'

interface AlbumsProps {
  auth: Auth
  history: History
}

interface AlbumsState {
  albums: Album[]
  newAlbumName: string
  loadingAlbums: boolean
}

export class Albums extends React.PureComponent<AlbumsProps, AlbumsState> {
  state: AlbumsState = {
    albums: [],
    newAlbumName: '',
    loadingAlbums: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newAlbumName: event.target.value })
  }

  onViewButtonClick = (albumId: string) => {
    this.props.history.push(`/albums/${albumId}`)
  }

  onAlbumCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newAlbum = await createAlbum(this.props.auth.getIdToken(), {
        name: this.state.newAlbumName,
        dueDate
      })
      this.setState({
        albums: [...this.state.albums, newAlbum],
        newAlbumName: ''
      })
    } catch {
      alert('Album creation failed')
    }
  }

  onAlbumDelete = async (albumId: string) => {
    try {
      await deleteAlbum(this.props.auth.getIdToken(), albumId)
      this.setState({
        albums: this.state.albums.filter(album => album.albumId !== albumId)
      })
    } catch {
      alert('Album deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const albums = await getAlbums(this.props.auth.getIdToken())
      this.setState({
        albums,
        loadingAlbums: false
      })
    } catch (e: any) {
      alert(`Failed to fetch albums: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Albums</Header>

        {this.renderCreateAlbumInput()}

        {this.renderAlbums()}
      </div>
    )
  }

  renderCreateAlbumInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Add new Album',
              onClick: this.onAlbumCreate
            }}
            fluid
            actionPosition="left"
            placeholder="My wedding photos..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderAlbums() {
    if (this.state.loadingAlbums) {
      return this.renderLoading()
    }

    return this.renderAlbumsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Albums
        </Loader>
      </Grid.Row>
    )
  }

  renderAlbumsList() {
    return (
      <Grid padded>
        {this.state.albums.map((album, pos) => {
          return (
            <Grid.Row key={album.albumId}>
              <Grid.Column width={10} verticalAlign="middle">
                {album.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right" verticalAlign="middle">
                {album.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onViewButtonClick(album.albumId)}
                >
                  <Icon name="eye" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onAlbumDelete(album.albumId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}

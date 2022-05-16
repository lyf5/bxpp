import { ElementType } from 'react'
import { Navigate } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { useAppState } from '../../state'

type PrivateRouteProps = {
  component: ElementType
  path: string
}

const PrivateRoute = ({ component: Component, path }: PrivateRouteProps) => {
  const { isAuthenticated } = useAppState()

  return (
    <Route
      path={path}
      element={(props: any) => (isAuthenticated ? <Component {...props} /> : <Navigate to="/" />)}
    />
  )
}

export { PrivateRoute }

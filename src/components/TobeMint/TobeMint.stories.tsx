import { Story, Meta } from '@storybook/react/types-6-0'

import { TobeMint, TobeMintProps } from './TobeMint'

export default {
  title: 'Views/TobeMint',
  component: TobeMint,
  parameters: {
    layout: 'padded',
  },
} as Meta

const Template: Story<TobeMintProps> = args => <TobeMint {...args} />

export const Default = Template.bind({})
Default.args = {} as TobeMintProps

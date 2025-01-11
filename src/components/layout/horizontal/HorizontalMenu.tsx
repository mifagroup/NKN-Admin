// Next Imports
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// import { GenerateHorizontalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import { menuUrls } from '@/@menu/utils/menuUrls'

// Menu Data Imports
// import menuData from '@/data/navigation/horizontalMenuData'

type RenderExpandIconProps = {
  level?: number
}

type RenderVerticalExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ level }: RenderExpandIconProps) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='ri-arrow-right-s-line' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }: RenderVerticalExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()

  const theme = useTheme()

  const params = useParams()

  const pathname = usePathname()

  // Vars
  const { transitionDuration } = verticalNavOptions

  const { lang: locale, id, slideId } = params

  const navigationTranslate = dictionary['navigation']

  const keywordsTranslate = dictionary['keywords']

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor: 'var(--mui-palette-background-default)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
        menuItemStyles={menuItemStyles(theme, 'ri-circle-fill')}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 4 : 14),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='ri-circle-fill' /> }
        }}
      >
        {/* Dashboard */}

        <MenuItem
          href={`/${locale}`}
          icon={<i className='ri-dashboard-line text-[20px]' />}
          title={navigationTranslate.dashboard}
        >
          {navigationTranslate.dashboard}
        </MenuItem>

        {/* <SubMenu label={navigationTranslate.product_management}>
          <SubMenu label={navigationTranslate.category} icon={<i className='ri-list-unordered text-[20px]' />}>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.category.list}`}
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
            >
              {keywordsTranslate.list}
            </MenuItem>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.category.add}`}
              icon={<i className='ri-add-box-line text-[20px]' />}
              title={keywordsTranslate.add}
            >
              {keywordsTranslate.add}
            </MenuItem>
          </SubMenu>
          <SubMenu label={navigationTranslate.brand} icon={<i className='ri-price-tag-3-line text-[20px]' />}>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.brand.list}`}
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
            >
              {keywordsTranslate.list}
            </MenuItem>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.brand.add}`}
              icon={<i className='ri-add-box-line text-[20px]' />}
              title={keywordsTranslate.add}
            >
              {keywordsTranslate.add}
            </MenuItem>
          </SubMenu>
          <SubMenu
            label={navigationTranslate.attribute_attribute_values}
            title={navigationTranslate.attribute_attribute_values}
            icon={<i className='ri-checkbox-line text-[20px]' />}
          >
            <MenuItem
              href={`/${locale}${menuUrls.product_management.attribute.list}`}
              icon={<i className='ri-list-unordered text-[20px]' />}
              title={keywordsTranslate.list}
            >
              {keywordsTranslate.list}
            </MenuItem>
            <MenuItem
              href={`/${locale}${menuUrls.product_management.attribute.add}`}
              icon={<i className='ri-add-box-line text-[20px]' />}
              title={keywordsTranslate.add}
            >
              {keywordsTranslate.add}
            </MenuItem>
          </SubMenu>
          <MenuItem
            href={`/${locale}${menuUrls.product_management.attributesGroup.list}`}
            icon={<i className='ri-checkbox-multiple-line text-[20px]' />}
            title={navigationTranslate.attribute_groups}
          >
            {navigationTranslate.attribute_groups}
          </MenuItem>
          <MenuItem icon={<i className='ri-inbox-line text-[20px]' />} title={navigationTranslate.products} disabled>
            {navigationTranslate.products}
          </MenuItem>
          <MenuItem
            icon={<i className='ri-price-tag-2-line text-[20px]' />}
            title={navigationTranslate.pricing_plans}
            disabled
          >
            {navigationTranslate.pricing_plans}
          </MenuItem>
          <MenuItem icon={<i className='ri-price-tag-line text-[20px]' />} title={navigationTranslate.tags} disabled>
            {navigationTranslate.tags}
          </MenuItem>
        </SubMenu> */}
      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu
